self.onmessage = function(e) {
  const { pattern, attackBase, maxLen, step } = e.data;
  try {
    const results = testReDoS(pattern, attackBase, maxLen, step);
    self.postMessage({ results });
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};

function parseAttackBase(attackBase) {
  const full = attackBase.trim();

  const onlyMid = /^"(.*)"\*\d+$/;
  const mOnly = full.match(onlyMid);
  if (mOnly) {
    return { prefix: "", middle: mOnly[1], suffix: "" };
  }

  const regex = /^(.*)?\s*\+\s*"(.*)"\*\d+\s*(?:\+\s*(.*))?$/;
  const m = full.match(regex);
  if (!m) {
    throw new Error('攻击串格式错误，应类似：\n" " + ":"*100000 + "\\n1\\n"\n或\n":"*100000');
  }

  const prefix = m[1] ? eval(m[1]) : "";
  const middle = m[2];
  const suffix = m[3] ? eval(m[3]) : "";

  return { prefix, middle, suffix };
}

function testReDoS(pattern, attackBase, maxLen, step) {
  let regex;
  try {
    regex = new RegExp(pattern);
  } catch (e) {
    throw new Error('正则编译错误: ' + e.message);
  }

  let parts;
  try {
    parts = parseAttackBase(attackBase);
  } catch (e) {
    throw e;
  }

  const results = {};
  for (let n = 1; n <= maxLen; n += step) {
    const attack = parts.prefix + parts.middle.repeat(n) + parts.suffix;
    const t0 = performance.now();
    try {
      regex.test(attack);
    } catch (_) {}
    const t1 = performance.now();
    results[n] = t1 - t0;
  }

  return results;
}
