async function getCoordinates() {
    let address = document.getElementById("address").value;

    if (address.trim() === "") {
        alert("Please enter an address!");
        return;
    }

    // Free Nominatim OpenStreetMap API URL
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.length > 0) {
            let lat = data[0].lat;
            let lon = data[0].lon;

            document.getElementById("output").innerHTML =
                `<b>Address:</b> ${data[0].display_name}<br>
                 <b>Latitude:</b> ${lat}<br>
                 <b>Longitude:</b> ${lon}`;
        } else {
            document.getElementById("output").innerHTML =
                "No results found. Try another address.";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("output").innerHTML =
            "Error fetching coordinates.";
    }
}
