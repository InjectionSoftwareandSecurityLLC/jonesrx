// Events page: dropdown colors, nav transitions, Bandsintown API
styleDropdown('ddTiktok', 'white');
styleDropdown('ddInsta', 'yellow');
styleDropdown('ddYouTube', 'red');
styleDropdown('ddFacebook', 'blue');

setupTvTransition('home-button', '/');

// Bandsintown API Call
async function fetchEvents() {
    const artistName = "Jones RX";
    const apiUrl = `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=26113258b4b0ab3265bf61cdb27edeab`;

    try {
        const response = await fetch(apiUrl);
        const events = await response.json();

        if (events.length > 0) {
            const eventsContainer = document.getElementById('events');
            events.forEach(event => {
                const eventDate = new Date(event.datetime).toLocaleDateString();
                const eventTime = new Date(event.datetime).toLocaleTimeString();
                var event_url = event.url;
                if(event.venue.name == "Jones RX @ miniFEST ATL - The Dark Horse Tavern"){
                    event_url = "https://bridgingmusic.com/event/atlanta-minifest-4-22-26/";
                }else if(event.venue.name == "Jones RX @ miniFEST Austin - The Vulcan Gas Co."){
                    event_url = "https://bridgingmusic.com/event/austin-minifest-5-6-26/"
                }
                const eventCard = `
                    <div class="col-md-12 mb-4 neon-events">
                        <div class="card bg-dark text-white neon-events-card h-100">
                            <div class="card-body">
                                <div class="event-details">
                                    <h5 class="card-title">${event.venue.name}</h5>
                                    <p class="card-text">${event.venue.location} - ${event.venue.country}</p>
                                    <p class="card-text"><strong>Date:</strong> ${eventDate}</p>
                                    <p class="card-text"><strong>Time:</strong> ${eventTime}</p>
                                </div>
                                <div class="event-action">
                                    <a href="${event_url}" target="_blank" class="neon-events-button">Tickets</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                eventsContainer.innerHTML += eventCard;
            });
        } else {
            document.getElementById('events').innerHTML = '<p class="text-white text-center neon-warn">No upcoming shows available.</p>';
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        document.getElementById('events').innerHTML = '<p class="text-white text-center neon-err">Could not load events. Please try again later.</p>';
    }
}

fetchEvents();

function clickThroughNotification(){
    var url = de("aHR0cHM6Ly9hNHRpZXQ3azVleHNldzdtN3h2cHFjYWN4aTBveWd4ZS5sYW1iZGEtdXJsLnVzLWVhc3QtMi5vbi5hd3Mv")
    fetch(url)
      .then(response => {
        if (response.ok) {
            window.location.href = "";
        } else {
            window.location.href = "";
        }
      })
      .catch(error => {
            window.location.href = "";
      });
}

function de(str) {
    return decodeURIComponent(escape(atob(str)));
}
