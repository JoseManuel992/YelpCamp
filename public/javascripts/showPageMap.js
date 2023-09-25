mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
  });

map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
    .setHTML(`
      <div class="popup-content">
        <div class="popup-left">
          <div class="popup-image-container">
            <img src="${campground.images.length ? campground.images[0].url : 'URL_TO_DEFAULT_IMAGE'}" alt="${campground.title}" class="popup-image">
          </div>
        </div>
        <div class="popup-right">
          <strong><h3 class="mapBox-popup-title" style="font-weight: 700;">${campground.title}</h3></strong>
          <p class="mapBox-popup-descriptionText">${campground.description.substring(0, 20)}...</p>
        </div>
      </div>
    `)
  )
  .addTo(map);
