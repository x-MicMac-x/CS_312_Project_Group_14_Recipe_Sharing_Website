const stars = document.querySelectorAll('.rating span');
const recipeId = document.querySelector('.rating').dataset.id;

 console.log(stars);

  const response = fetch(`/recipes/${recipeId}/rate`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

stars.forEach(star => {
  star.addEventListener('click', async () => {
    const rating = Number(star.getAttribute('data-value'));

    console.log(rating);

    // Remove 'selected' class from all stars
    stars.forEach(s => s.classList.remove('selected'));

    // Add 'selected' to clicked star and all stars *after* it (because of rtl direction)
    star.classList.add('selected');
    let next = star.nextElementSibling;
    while (next) {
      next.classList.add('selected');
      next = next.nextElementSibling;
    }
    
    
    await fetch(`/recipes/${recipeId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    });
  });
});


