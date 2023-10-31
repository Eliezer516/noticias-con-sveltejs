<script>
</script>

<div class="loader-container">
  <div class="loading-bar"></div>
</div>


<style>
  .loader-container {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,0.2);
    display: grid;
    place-items: center;
  }

  .loading-bar,
  .loading-bar:before,
  .loading-bar:after {
      width: 1rem;
      height: 3rem;
      background-color: #0074d9;
      animation: animateBar 1s ease-in-out infinite;
  }
  .loading-bar {
      animation-delay: -.16s;
      position: relative;
      display: flex;
      align-items: center;
  }
  .loading-bar:before {
      position: absolute;
      right: 2rem;
      content: '';
  }
  .loading-bar:after {
      position: absolute;
      animation-delay: -.32s;
      content: '';
      left: 2rem;
  }

  @keyframes animateBar {
      0% {
          height: 3rem;
      }
      50% {
          height: 6rem
      }
      100% {
          height: 3rem
      }
  }
</style>
