() => {
  const element = document.querySelector('.app-version');
  if (!element || element.textContent.trim() !== '版本 0.1.0 rc2') throw Error('Version text differs');
  element.scrollIntoView({block:'center'});
  const range=document.createRange(); range.selectNodeContents(element);
  const rect=range.getBoundingClientRect();
  const bounds=element.getBoundingClientRect();
  if(rect.left < 0 || rect.right > innerWidth || element.scrollWidth > element.clientWidth) throw Error('Version is horizontally clipped');
  if(element.closest('[tabindex]') || element.querySelector('[tabindex],button,a,input')) throw Error('Version introduces focus target');
  return {viewport:innerWidth, devicePixelRatio, text:element.textContent.trim(), textBounds:{left:rect.left,right:rect.right}, elementBounds:{left:bounds.left,right:bounds.right}, documentWidth:document.documentElement.scrollWidth};
}