const IMAGE_VIEWER_VERSION='1.0';

function closeDriverImageViewer(){
  const modal=document.getElementById('driverImageViewer');
  if(modal) modal.classList.remove('open');
}

function openDriverImageViewer(src,alt='Driver photo'){
  if(!src)return;
  let modal=document.getElementById('driverImageViewer');

  if(!modal){
    modal=document.createElement('div');
    modal.id='driverImageViewer';
    modal.className='driver-image-viewer';
    modal.innerHTML=
      '<div class="driver-image-viewer-backdrop" data-image-viewer-close></div>'+
      '<div class="driver-image-viewer-dialog" role="dialog" aria-modal="true" aria-label="Driver photo">'+
        '<button type="button" class="driver-image-viewer-close" aria-label="Close photo" data-image-viewer-close>×</button>'+
        '<img id="driverImageViewerImage" alt="">'+
        '<div id="driverImageViewerCaption" class="driver-image-viewer-caption"></div>'+
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click',event=>{
      if(event.target.closest('[data-image-viewer-close]')) closeDriverImageViewer();
    });
  }

  const image=modal.querySelector('#driverImageViewerImage');
  const caption=modal.querySelector('#driverImageViewerCaption');
  if(image){
    image.src=src;
    image.alt=alt;
  }
  if(caption)caption.textContent=alt;
  modal.classList.add('open');
}

document.addEventListener('click',event=>{
  const image=event.target.closest?.('.zoomable-driver-photo');
  if(!image)return;
  event.preventDefault();
  openDriverImageViewer(image.currentSrc||image.src,image.alt||'Driver photo');
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeDriverImageViewer();
});

window.openDriverImageViewer=openDriverImageViewer;
window.closeDriverImageViewer=closeDriverImageViewer;
