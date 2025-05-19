
const translations = {
   hu: {
    title:               "HotelManagerApp",
    bookRoom:            "Szoba foglal�sa",
    listBookings:        "Foglal�sok list�z�sa",
    roomsAndBookings:    "Szob�k �s foglal�sok",
    cancelBooking:       "Foglal�s t�rl�se",
    payment:             "Fizet�s",
    revenueStats:        "Bev�tel statisztika",
    occupancyStats:      "Kihaszn�lts�g statisztika",
    bookingTitle:        "Szoba foglal�sa",
    lblName:             "N�v",
    phName:              "Vend�g neve",
    lblCheckin:          "Bejelentkez�s",
    lblCheckout:         "Kijelentkez�s",
    lblPeople:           "Embersz�m",
    btnBook:             "Foglal�s",
    msgBookSuccess:      "Foglal�s sikeres! ID: {0}, Szoba: {1}",
    msgBookNoGuest:      "Ismeretlen vend�g",
    msgBookNoRooms:      "Nincs el�rhet� szoba",
    backBTN:		     "Vissza", 
    bookingsTitle:       "Foglal�sok list�z�sa",
    lblFrom:             "Kezd� d�tum",
    lblTo:               "Z�r� d�tum",
    btnQuery:            "Lek�rdez",
    colID:               "ID",
    colGuest:            "Vend�g",
    colRoom:             "Szoba",
    colPeople:           "Emberek",
    colCheckIn:          "Be",
    colCheckOut:         "Ki",
    colRate:             "�r/�j",
    roomsTitle:          "Szob�k �s foglal�sok",
    lblStart:            "Kezd� d�tum",
    lblEnd:              "Z�r� d�tum",
    btnRoomsQuery:       "Lek�rdez",
    roomHeading:         "Szoba {0} (Kapacit�s: {1})",
    statusOccupied:      "Jelenleg foglalt",
    statusAvailable:     "Jelenleg szabad",
    cancelTitle:         "Foglal�s t�rl�se",
    lblCancelID:         "Foglal�s ID (GUID)",
    btnCancel:           "T�rl�s",
    msgCancelSuccess:    "T�r�lve",
    msgCancelFail:       "Nem tal�lhat�",
    paymentTitle:        "Fizet�s",
    lblSelectBooking:    "Foglal�s kiv�laszt�sa",
    optChoose:           "-- v�lassz --",
    lblRoomNumber:       "Szoba sz�ma",
    lblNights:           "�jszak�k sz�ma",
    lblRate:             "�r/�j (Ft)",
    btnCalc:             "Sz�m�t�s �s fizet�s",
    btnMarkPaid:         "Jel�l�s kifizetettnek",
    msgPaySuccess:       "Fizet�s sikeres",
    msgPayFail:          "A fizet�s sikertelen",
    msgNetworkError:     "H�l�zati hiba",
    revenueTitle:        "Bev�tel statisztika",
    lblMonthStart:       "Kezd� h�nap",
    lblMonthEnd:         "Z�r� h�nap",
    btnRevenueQuery:     "Lek�rdez",
    chartTitleRevenue:   "Bev�tel alakul�sa",
    occupancyTitle:      "Kihaszn�lts�g statisztika",
    lblOccStart:         "Kezd� d�tum",
    lblOccEnd:           "Z�r� d�tum",
    btnOccQuery:         "Lek�rdez",
    chartTitleOccupancy: "Kihaszn�lts�g ar�nya",
    errorTitle:          "Hiba",
    errorMsg:            "Az oldal felt�lt�s alatt �ll..."
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
