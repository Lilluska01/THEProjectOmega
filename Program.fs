open Giraffe
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting

let webApp = 
    choose [
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
