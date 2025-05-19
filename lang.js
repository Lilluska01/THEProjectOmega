
const translations = {
   hu: {
    title:               "HotelManagerApp",
    bookRoom:            "Szoba foglalása",
    listBookings:        "Foglalások listázása",
    roomsAndBookings:    "Szobák és foglalások",
    cancelBooking:       "Foglalás törlése",
    payment:             "Fizetés",
    revenueStats:        "Bevétel statisztika",
    occupancyStats:      "Kihasználtság statisztika",
    bookingTitle:        "Szoba foglalása",
    lblName:             "Név",
    phName:              "Vendég neve",
    lblCheckin:          "Bejelentkezés",
    lblCheckout:         "Kijelentkezés",
    lblPeople:           "Emberszám",
    btnBook:             "Foglalás",
    msgBookSuccess:      "Foglalás sikeres! ID: {0}, Szoba: {1}",
    msgBookNoGuest:      "Ismeretlen vendég",
    msgBookNoRooms:      "Nincs elérhetõ szoba",
    backBTN:		     "Vissza", 
    bookingsTitle:       "Foglalások listázása",
    lblFrom:             "Kezdõ dátum",
    lblTo:               "Záró dátum",
    btnQuery:            "Lekérdez",
    colID:               "ID",
    colGuest:            "Vendég",
    colRoom:             "Szoba",
    colPeople:           "Emberek",
    colCheckIn:          "Be",
    colCheckOut:         "Ki",
    colRate:             "Ár/éj",
    roomsTitle:          "Szobák és foglalások",
    lblStart:            "Kezdõ dátum",
    lblEnd:              "Záró dátum",
    btnRoomsQuery:       "Lekérdez",
    roomHeading:         "Szoba {0} (Kapacitás: {1})",
    statusOccupied:      "Jelenleg foglalt",
    statusAvailable:     "Jelenleg szabad",
    cancelTitle:         "Foglalás törlése",
    lblCancelID:         "Foglalás ID (GUID)",
    btnCancel:           "Törlés",
    msgCancelSuccess:    "Törölve",
    msgCancelFail:       "Nem található",
    paymentTitle:        "Fizetés",
    lblSelectBooking:    "Foglalás kiválasztása",
    optChoose:           "-- válassz --",
    lblRoomNumber:       "Szoba száma",
    lblNights:           "Éjszakák száma",
    lblRate:             "Ár/éj (Ft)",
    btnCalc:             "Számítás és fizetés",
    btnMarkPaid:         "Jelölés kifizetettnek",
    msgPaySuccess:       "Fizetés sikeres",
    msgPayFail:          "A fizetés sikertelen",
    msgNetworkError:     "Hálózati hiba",
    revenueTitle:        "Bevétel statisztika",
    lblMonthStart:       "Kezdõ hónap",
    lblMonthEnd:         "Záró hónap",
    btnRevenueQuery:     "Lekérdez",
    chartTitleRevenue:   "Bevétel alakulása",
    occupancyTitle:      "Kihasználtság statisztika",
    lblOccStart:         "Kezdõ dátum",
    lblOccEnd:           "Záró dátum",
    btnOccQuery:         "Lekérdez",
    chartTitleOccupancy: "Kihasználtság aránya",
    errorTitle:          "Hiba",
    errorMsg:            "Az oldal feltöltés alatt áll..."
  },
  en: {
    title:               "HotelManagerApp",
    bookRoom:            "Book Room",
    listBookings:        "List Bookings",
    roomsAndBookings:    "Rooms & Bookings",
    cancelBooking:       "Cancel Booking",
    payment:             "Payment",
    revenueStats:        "Revenue Statistics",
    occupancyStats:      "Occupancy Statistics",
    backBTN:		     "Back", 
    bookingTitle:        "Book a Room",
    lblName:             "Name",
    phName:              "Guest Name",
    lblCheckin:          "Check-in",
    lblCheckout:         "Check-out",
    lblPeople:           "Number of Guests",
    btnBook:             "Book",
    msgBookSuccess:      "Booking successful! ID: {0}, Room: {1}",
    msgBookNoGuest:      "Guest unknown",
    msgBookNoRooms:      "No rooms available",
    bookingsTitle:       "List Bookings",
    lblFrom:             "From",
    lblTo:               "To",
    btnQuery:            "Query",
    colID:               "ID",
    colGuest:            "Guest",
    colRoom:             "Room",
    colPeople:           "People",
    colCheckIn:          "In",
    colCheckOut:         "Out",
    colRate:             "Price/night",
    roomsTitle:          "Rooms & Bookings",
    lblStart:            "Start Date",
    lblEnd:              "End Date",
    btnRoomsQuery:       "Query",
    roomHeading:         "Room {0} (Capacity: {1})",
    statusOccupied:      "Currently occupied",
    statusAvailable:     "Currently available",
    cancelTitle:         "Cancel Booking",
    lblCancelID:         "Booking ID (GUID)",
    btnCancel:           "Delete",
    msgCancelSuccess:    "Deleted",
    msgCancelFail:       "Not found",
    paymentTitle:        "Payment",
    lblSelectBooking:    "Select Booking",
    optChoose:           "-- choose --",
    lblRoomNumber:       "Room Number",
    lblNights:           "Nights",
    lblRate:             "Rate/night (Ft)",
    btnCalc:             "Calculate & Pay",
    btnMarkPaid:         "Mark as Paid",
    msgPaySuccess:       "Payment successful",
    msgPayFail:          "Payment failed",
    msgNetworkError:     "Network error",
    revenueTitle:        "Revenue Statistics",
    lblMonthStart:       "Start Month",
    lblMonthEnd:         "End Month",
    btnRevenueQuery:     "Query",
    chartTitleRevenue:   "Revenue Over Time",
    occupancyTitle:      "Occupancy Statistics",
    lblOccStart:         "Start Date",
    lblOccEnd:           "End Date",
    btnOccQuery:         "Query",
    chartTitleOccupancy: "Occupancy Rate",
    errorTitle:          "Error",
    errorMsg:            "This page is under construction..."
  }
};

function getLang() {
  return localStorage.getItem("lang") || "hu";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  translatePage();
}

function translatePage() {
  const lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const text = translations[lang][key];
    if (text !== undefined) {
      if (el.hasAttribute("data-i18n-ph")) {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });
  document.getElementById("hu-btn").classList.toggle("active", lang === "hu");
  document.getElementById("en-btn").classList.toggle("active", lang === "en");
}

document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.createElement("div");
  switcher.id = "lang-switcher";
  switcher.innerHTML = `
    <button id="hu-btn">HU</button>
    <button id="en-btn">EN</button>
  `;
  document.body.appendChild(switcher);
  document.getElementById("hu-btn").addEventListener("click", () => setLang("hu"));
  document.getElementById("en-btn").addEventListener("click", () => setLang("en"));
  translatePage();
});
