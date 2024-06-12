document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('scroll', stonks);
  var navbar = document.getElementById("navbar");
  var sticky = navbar.offsetTop;
  function stonks() {
  if (window.scrollY >= sticky) {
      console.log("window.pageYOffset >= sticky");
  } else {
      console.log("Not window.pageYOffset >= sticky");
  }
  if (window.scrollY >= sticky) {
      navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
   }
})