const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 page.on('response',r=>{if(r.status()>=400)failures.push(r.status()+' '+r.url());});
 fs.mkdirSync('.audit_tmp',{recursive:true});
 await page.goto(process.env.REVIEW_URL||'http://localhost:4192/',{waitUntil:'networkidle'});
 const order=await page.locator('main>section').evaluateAll(els=>els.map(e=>e.id));
 if(order.join(',')!=='top,asset,concept,territory,facts,engineering,materials,visualizations,scenarios,location,actual,questions,contacts')failures.push('Wrong section order: '+order);
 for(const width of [1920,1440,1366,768,390]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'.audit_tmp/hero-'+width+'.png'});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))failures.push('Overflow '+width);
  for(const id of ['concept','facts','engineering','materials','location','actual','contacts']){
   await page.locator('#'+id).scrollIntoViewIfNeeded();
   await page.waitForTimeout(120);
   if([1440,390].includes(width))await page.locator('#'+id).screenshot({path:'.audit_tmp/'+id+'-'+width+'.png',style:'.lot-header,.skip-link,.lot-sticky-cta,.mobile-contact-bar{visibility:hidden!important}'});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#top [data-contact-choice-open]').click();
 if(!await page.locator('[data-contact-choice]').evaluate(e=>e.open))failures.push('Contact dialog failed');
 const wa=await page.locator('[data-choice-channel="whatsapp"]').getAttribute('href');
 if(new URL(wa).searchParams.get('text')!=='Здравствуйте! Интересует земельный массив «Новое Бородино».')failures.push('Wrong message');
 await page.keyboard.press('Escape');
 await page.locator('[data-concept-open]').click();
 await page.locator('[data-zoom="in"]').click();
 if(!await page.locator('.lightbox-scroll').evaluate(e=>e.classList.contains('is-zoomed')))failures.push('Zoom failed');
 await page.keyboard.press('Escape');
 await page.locator('[data-actual-next]').click();
 await page.waitForTimeout(800);
 if(!(await page.locator('[data-actual-count]').innerText()).includes('02'))failures.push('Gallery navigation failed');
 await page.locator('#questions details').nth(6).locator('summary').click();
 if(!await page.locator('#questions details').nth(6).evaluate(e=>e.open))failures.push('FAQ failed');
 await page.evaluate(async()=>{const imgs=[...document.images].filter(i=>i.src);imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});
 const broken=await page.locator('img[src]').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src));
 failures.push(...broken.map(x=>'Broken image '+x));
 console.log(JSON.stringify({order,failures,screenshots:'.audit_tmp'},null,2));
 await browser.close();
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
