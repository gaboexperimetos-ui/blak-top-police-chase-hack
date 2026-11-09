// Pegar en la CONSOLA de DevTools (F12) seleccionando el frame/origen *.poki-gdn.com (no "top")
(() => {
  const key = 'Blacktop1_Save';
  const raw = localStorage.getItem(key);
  if (!raw) return console.error('No se encontró', key, '- asegúrate de estar en el frame del juego (poki-gdn.com)');
  const s = JSON.parse(raw);
  const cars = [];
  for (let x = 0; x <= 20; x++) for (let y = 0; y <= 10; y++) cars.push({x, y});
  s.money = 999999999;
  s.unlockedCars = cars;
  s.hiScore = Math.max(Number(s.hiScore)||0, 999999);
  localStorage.setItem(key, JSON.stringify(s));
  console.log('OK. Guardado actualizado:', {money:s.money, cars:s.unlockedCars.length, key});
  console.log('Recarga la página del juego para ver todos los vehículos/dinero.');
})();
