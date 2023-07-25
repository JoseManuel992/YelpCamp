const form = document.querySelector('.validated-form');
const ratingRadios = document.querySelectorAll('input[name="review[rating]"]');
const errorDiv = document.createElement('div');
errorDiv.classList.add('alert', 'alert-danger', 'my-4');
errorDiv.innerText = 'Please select a rating from 1 to 5 stars.';
errorDiv.style.display = 'none';

form.addEventListener('submit', (event) => {
  if (!isRatingSelected()) {
    event.preventDefault();
    errorDiv.style.display = 'block';
  }
});

const parentDiv = document.querySelector('.my-4');
parentDiv.insertBefore(errorDiv, form);

function isRatingSelected() {
  for (let i = 0; i < ratingRadios.length; i++) {
    if (ratingRadios[i].checked && ratingRadios[i].value !== '0') {
      return true;
    }
  }
  return false;
}
