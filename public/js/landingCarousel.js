fetch('https://picsum.photos/v2/list?limit=100')
.then((result) => result.json())
.then((pics) => {
  const randomPics = [
    pics[Math.floor(Math.random() * 100)],
    pics[Math.floor(Math.random() * 100)],
    pics[Math.floor(Math.random() * 100)],
    pics[Math.floor(Math.random() * 100)],
    pics[Math.floor(Math.random() * 100)],
        ];
  const carouselContents = randomPics.reduce((finalString, curr) => finalString + 
    `<div class="carousel-item rounded-lg">
       <img src="https://picsum.photos/id/${curr.id}/800/400" class="d-block w-100">
     </div>`, '');
  document.querySelector('#carouselLandingPage').innerHTML = carouselContents;
  document.querySelector('.carousel-item:first-child').classList.add('active');
})
.catch(() => {
  document.querySelector('#carouselLandingPage').innerHTML = 
  `<div class="carousel-item">
     <img src="https://www.stevensegallery.com/g/800/600" class="d-block w-100">
   </div>`;
  document.querySelector('.carousel-item:first-child').classList.add('active');
});