(async () => {
  const css = await (
    await fetch('https://fonts.googleapis.com/css2?family=Pacifico&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0' },
    })
  ).text();
  console.log('--- css head ---');
  console.log(css.slice(0, 900));
})();
