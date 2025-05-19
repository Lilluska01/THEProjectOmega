open System
open System.Threading.Tasks
open Giraffe
open FSharp.Control.Tasks.V2.ContextInsensitive
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.AspNetCore.Http

module Domain =
    type Guest = { Id: Guid; Name: string; RoomNumber: int }
    type Room  = { Number: int; Capacity: int; IsAvailable: bool }
    type Booking =
        { Id          : Guid
          GuestId     : Guid
          RoomNumber  : int
          PeopleCount : int
          CheckIn     : DateTime
          CheckOut    : DateTime
          NightlyRate : decimal
          Paid        : bool }
    type BookingDto =
        { Name        : string
          PeopleCount : int
          CheckIn     : DateTime
          CheckOut    : DateTime
          Rate        : decimal }
    type BookingInfo =
        { Id           : Guid
          GuestName    : string
          RoomNumber   : int
          PeopleCount  : int
          CheckIn      : DateTime
          CheckOut     : DateTime
          NightlyRate  : decimal
          Paid         : bool }
    type PaymentDto =
        { bookingId : Guid
          nights    : int
          rate      : decimal }
    type PaymentResult =
        { bookingId   : Guid
          roomNumber  : int
          peopleCount : int
          nights      : int
          rate        : decimal
          total       : decimal }
    type RevenueRecord =
        { roomNumber : int
          total      : decimal }
    type MarkPaidDto = { id: Guid }

    type HotelState =
        { Guests   : Map<Guid, Guest>
          Rooms    : Map<int, Room>
          Bookings : Map<Guid, Booking> }

module State =
    open Domain

    type StateMessage =
        | RegisterGuest       of string  * AsyncReplyChannel<Guest>
        | CancelBooking       of Guid    * AsyncReplyChannel<bool>
        | GetGuestByName      of string  * AsyncReplyChannel<Guest option>
        | CreateBooking       of Guid * int * DateTime * DateTime * decimal * AsyncReplyChannel<Booking option>
        | GetAllBookingInfo   of AsyncReplyChannel<BookingInfo list>
        | GetAllRooms         of AsyncReplyChannel<Room list>
        | GetAvailabilitySpan of DateTime * DateTime * int * AsyncReplyChannel<(DateTime * bool) list>
        | GetRoomBookings     of int     * AsyncReplyChannel<Booking list>
        | GetBookingById      of Guid    * AsyncReplyChannel<Booking option>
        | MarkPaid            of Guid    * AsyncReplyChannel<bool>
        | GetRevenue          of AsyncReplyChannel<RevenueRecord list>

    let agent =
        MailboxProcessor.Start(fun inbox ->
            let rooms =
                [1..25]
                |> List.map (fun n ->
                    let cap = if n % 2 = 0 then 4 else 3
                    n, { Number = n; Capacity = cap; IsAvailable = true })
                |> Map.ofList

            let initial : HotelState =
                { Guests   = Map.empty
                  Rooms    = rooms
                  Bookings = Map.empty }

            let rec loop (state: HotelState) = async {
                let! msg = inbox.Receive()
                match msg with

                | RegisterGuest(name, reply) ->
                    let freeOpt = state.Rooms |> Map.filter (fun _ r -> r.IsAvailable) |> Map.keys |> Seq.tryHead
                    let guest, newState =
                        match freeOpt with
                        | Some room ->
                            let g  = { Id = Guid.NewGuid(); Name = name; RoomNumber = room }
                            let gs = state.Guests.Add(g.Id, g)
                            let rs = state.Rooms.Add(room, { state.Rooms.[room] with IsAvailable = false })
                            g, { state with Guests = gs; Rooms = rs }
                        | None ->
                            { Id = Guid.Empty; Name = name; RoomNumber = -1 }, state
                    reply.Reply guest
                    return! loop newState

                | CancelBooking(bid, reply) ->
                    match state.Bookings.TryFind bid with
                    | Some b ->
                        let bs = state.Bookings.Remove bid
                        let rs = state.Rooms.Add(b.RoomNumber, { state.Rooms.[b.RoomNumber] with IsAvailable = true })
                        reply.Reply true
                        return! loop { state with Bookings = bs; Rooms = rs }
                    | None ->
                        reply.Reply false
                        return! loop state

                | GetGuestByName(name, reply) ->
                    let gOpt = state.Guests |> Map.tryPick (fun _ g -> if g.Name = name then Some g else None)
                    reply.Reply gOpt
                    return! loop state

                | CreateBooking(gid, pc, ci, co, rate, reply) ->
                    let existing = state.Bookings |> Map.toList |> List.map snd
                    let candidate =
                        state.Rooms.Values
                        |> Seq.filter (fun r -> r.Capacity >= pc)
                        |> Seq.tryFind (fun r ->
                            existing
                            |> List.forall (fun b ->
                                b.RoomNumber <> r.Number ||
                                co <= b.CheckIn ||
                                ci >= b.CheckOut))
                    let bOpt, newState =
                        match candidate with
                        | Some r ->
                            let b =
                                { Id          = Guid.NewGuid()
                                  GuestId     = gid
                                  RoomNumber  = r.Number
                                  PeopleCount = pc
                                  CheckIn     = ci
                                  CheckOut    = co
                                  NightlyRate = rate
                                  Paid        = false }
                            Some b, { state with Bookings = state.Bookings.Add(b.Id, b) }
                        | None ->
                            None, state
                    reply.Reply bOpt
                    return! loop newState

                | GetAllBookingInfo(reply) ->
                    let infos =
                        state.Bookings
                        |> Map.toList |> List.map snd
                        |> List.map (fun b ->
                            let name = state.Guests.[b.GuestId].Name
                            { Id           = b.Id
                              GuestName    = name
                              RoomNumber   = b.RoomNumber
                              PeopleCount  = b.PeopleCount
                              CheckIn      = b.CheckIn
                              CheckOut     = b.CheckOut
                              NightlyRate  = b.NightlyRate
                              Paid         = b.Paid })
                    reply.Reply infos
                    return! loop state

                | GetAllRooms(reply) ->
                    reply.Reply (state.Rooms |> Map.toList |> List.map snd)
                    return! loop state

                | GetAvailabilitySpan(d1, d2, pc, reply) ->
                    let days =
                        Seq.unfold (fun d -> if d > d2 then None else Some(d, d.AddDays(1.))) d1
                        |> Seq.toList
                    let caps = state.Rooms |> Map.toList |> List.map snd |> List.filter (fun r -> r.Capacity >= pc)
                    let span =
                        days
                        |> List.map (fun day ->
                            let occ =
                                state.Bookings
                                |> Map.toList |> List.map snd
                                |> List.filter (fun b -> b.CheckIn <= day && day < b.CheckOut)
                                |> List.length
                            day, occ < caps.Length)
                    reply.Reply span
                    return! loop state

                | GetRoomBookings(roomNum, reply) ->
                    let bs =
                        state.Bookings |> Map.toList |> List.map snd
                        |> List.filter (fun b -> b.RoomNumber = roomNum)
                    reply.Reply bs
                    return! loop state

                | GetBookingById(id, reply) ->
                    reply.Reply (state.Bookings.TryFind id)
                    return! loop state

                | MarkPaid(id, reply) ->
                    match state.Bookings.TryFind id with
                    | Some b when not b.Paid ->
                        let updated = { b with Paid = true }
                        let bs      = state.Bookings.Add(id, updated)
                        reply.Reply true
                        return! loop { state with Bookings = bs }
                    | _ ->
                        reply.Reply false
                        return! loop state

                | GetRevenue(reply) ->
                    let paid =
                        state.Bookings |> Map.toList |> List.map snd |> List.filter (fun b -> b.Paid)
                    let byRoom =
                        paid
                        |> List.groupBy (fun b -> b.RoomNumber)
                        |> List.map (fun (room, bs) ->
                            let total =
                                bs |> List.sumBy (fun b ->
                                    let nights = (b.CheckOut - b.CheckIn).Days
                                    decimal b.PeopleCount * b.NightlyRate * decimal nights)
                            { roomNumber = room; total = total })
                    reply.Reply byRoom
                    return! loop state
            }
            loop initial)

module Handlers =
    open Domain
    open State
    let register: HttpHandler =
        fun next ctx -> task {
            let! name = ctx.BindJsonAsync<string>()
            let! g    = agent.PostAndAsyncReply(fun rc -> RegisterGuest(name, rc)) |> Async.StartAsTask
            return! json g next ctx }

    let cancelBooking: HttpHandler =
        fun next ctx -> task {
            let! id = ctx.BindJsonAsync<Guid>()
            let! ok = agent.PostAndAsyncReply(fun rc -> CancelBooking(id, rc)) |> Async.StartAsTask
            return! json {| Success = ok |} next ctx }

    let book: HttpHandler =
        fun next ctx -> task {
            let! dto = ctx.BindJsonAsync<BookingDto>()
            let! gOpt = agent.PostAndAsyncReply(fun rc -> GetGuestByName(dto.Name, rc)) |> Async.StartAsTask
            let! guest =
                match gOpt with
                | Some g -> Task.FromResult g
                | None   -> agent.PostAndAsyncReply(fun rc -> RegisterGuest(dto.Name, rc)) |> Async.StartAsTask
            let! bOpt = agent.PostAndAsyncReply(fun rc ->
                            CreateBooking(guest.Id, dto.PeopleCount, dto.CheckIn, dto.CheckOut, dto.Rate, rc))
                         |> Async.StartAsTask
            return!
                match bOpt with
                | Some b -> json b
                | None   -> RequestErrors.BAD_REQUEST "Nincs megfelelõ szoba"
                <| next <| ctx }

    let listBookings: HttpHandler =
        fun next ctx -> task {
            let! infos = agent.PostAndAsyncReply(fun rc -> GetAllBookingInfo(rc)) |> Async.StartAsTask
            return! json infos next ctx }

    let listRooms: HttpHandler =
        fun next ctx -> task {
            let! rs = agent.PostAndAsyncReply(fun rc -> GetAllRooms(rc)) |> Async.StartAsTask
            return! json rs next ctx }

    let availability: HttpHandler =
        fun next ctx -> task {
            let qp     = ctx.Request.Query
            let from   = DateTime.Parse(qp["from"].ToString())
            let toD    = DateTime.Parse(qp["to"].ToString())
            let people = Int32.Parse(qp["people"].ToString())
            let! span = agent.PostAndAsyncReply(fun rc -> GetAvailabilitySpan(from, toD, people, rc)) |> Async.StartAsTask
            return! json span next ctx }

    let roomBookings: HttpHandler =
        fun next ctx -> task {
            let roomNum = Int32.Parse(ctx.Request.Query["room"].ToString())
            let! bs = agent.PostAndAsyncReply(fun rc -> GetRoomBookings(roomNum, rc)) |> Async.StartAsTask
            return! json bs next ctx }

    let processPayment: HttpHandler =
        fun next ctx -> task {
            let! dto = ctx.BindJsonAsync<PaymentDto>()
            let! bOpt = agent.PostAndAsyncReply(fun rc -> GetBookingById(dto.bookingId, rc)) |> Async.StartAsTask
            return!
                match bOpt with
                | None -> RequestErrors.NOT_FOUND "Foglalás nem található" next ctx
                | Some b ->
                    let total =
                        decimal dto.rate *
                        decimal dto.nights *
                        decimal b.PeopleCount
                    let res =
                        { bookingId   = dto.bookingId
                          roomNumber  = b.RoomNumber
                          peopleCount = b.PeopleCount
                          nights      = dto.nights
                          rate        = dto.rate
                          total       = total }
                    json res next ctx }

    let markPaid: HttpHandler =
        fun next ctx -> task {
            let! raw = ctx.BindJsonAsync<string>()
            let id   = Guid(raw)
            let! ok  = agent.PostAndAsyncReply(fun rc -> MarkPaid(id, rc)) |> Async.StartAsTask
            return! json {| Success = ok |} next ctx }

    let revenue: HttpHandler =
        fun next ctx -> task {
            let! rev = agent.PostAndAsyncReply(fun rc -> GetRevenue(rc)) |> Async.StartAsTask
            return! json rev next ctx }

let webApp: HttpHandler =
    choose [
        POST >=> route "/register"     >=> Handlers.register
        POST >=> route "/cancel"       >=> Handlers.cancelBooking
        POST >=> route "/booking"      >=> Handlers.book
        GET  >=> route "/bookings"     >=> Handlers.listBookings
        GET  >=> route "/rooms"        >=> Handlers.listRooms
        GET  >=> route "/availability" >=> Handlers.availability
        GET  >=> route "/roomBookings" >=> Handlers.roomBookings
        POST >=> route "/payment"      >=> Handlers.processPayment
        POST >=> route "/paid"         >=> Handlers.markPaid
        GET  >=> route "/revenue"      >=> Handlers.revenue
        setStatusCode 404 >=> text "Not Found"
    ]

[<EntryPoint>]
let main _ =
    let builder = WebApplication.CreateBuilder()
    builder.Services.AddGiraffe() |> ignore
    let app = builder.Build()
    app.UseDefaultFiles() |> ignore
    app.UseStaticFiles() |> ignore
    app.UseGiraffe webApp |> ignore
    app.Run()
    0
