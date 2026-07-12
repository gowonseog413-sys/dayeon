import fs from "fs";

const p = new URL("../src/app/erp/settings/permissions/page.tsx", import.meta.url);
let s = fs.readFileSync(p, "utf8");

const reps = [
  ['"?? ??? ???? ?????."', '"\uC0AC\uC6D0 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."'],
  ['showSuccess("?? ??? ???????.");', 'showSuccess("\uC2E0\uADDC \uC0AC\uC6D0\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");'],
  ['showSuccess("?? ??? ???????.");', 'showSuccess("\uC0AC\uC6D0 \uC815\uBCF4\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");', true],
  ['"??? ??????."', '"\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."'],
  ['`??? ${deletable.length}?? ??????`', '`\uC120\uD0DD\uD55C ${deletable.length}\uBA85\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?`'],
  ['showSuccess("??? ??? ???????.");', 'showSuccess("\uC120\uD0DD\uD55C \uC0AC\uC6D0\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");'],
  ['title="????"', 'title="\uAD8C\uD55C\uAD00\uB9AC"'],
  ['"? ? ??"', '"\uC54C \uC218 \uC5C6\uC74C"'],
  ['description="??? ???? ERP ?? ID???????? ??? ?????."', 'description="\uB9C8\uC2A4\uD130 \uAD00\uB9AC\uC790\uAC00 ERP \uC9C1\uC6D0 ID\u00B7\uBE44\uBC00\uBC88\uD638\u00B7\uBA54\uB274 \uAD8C\uD55C\uC744 \uBD80\uC5EC\uD569\uB2C8\uB2E4."'],
  ['aria-label="?? ??"', 'aria-label="\uAD8C\uD55C \uBD84\uB958"'],
  ['              ?? ??', '              \uC804\uCCB4 \uC0AC\uC6D0'],
  ['{staff.length}?', '{staff.length}\uBA85'],
  ['{count}?', '{count}\uBA85'],
  ['"??? ??"', '"\uAD00\uB9AC\uC790 \uBAA8\uB4DC"'],
  ['?? ?? ??', '\uC804\uCCB4 \uC0AC\uC6D0 \uC870\uD68C'],
  ['? {filteredStaff.length}?', '\uCD1D {filteredStaff.length}\uBA85'],
  ['placeholder="?? / ?? / ??"', 'placeholder="\uC774\uB984 / \uBD80\uC11C / \uC9C1\uAE09"'],
  ['+ ??', '+ \uCD94\uAC00'],
  ['>??<', '>\uC218\uC815<'],
  ['>????<', '>\uC0AD\uC81C<'],
  ['>?????<', '>\uC0C8\uB85C\uACE0\uCE68<'],
  ['>??<', '>\uC120\uD0DD<'],
  ['>?? ????<', '>\uCD5C\uADFC \uC811\uC18D\uB0A0\uC9DC<'],
  ['>???<', '>\uC785\uC0AC\uC77C<'],
  ['>??<', '>\uC9C1\uAE09<'],
  ['>??<', '>\uBD80\uC11C<'],
  ['>??<', '>\uC131\uBA85<'],
  ['>?? (ID)<', '>\uBA54\uC77C (ID)<'],
  ['>???<', '>\uC5F0\uB77D\uCC98<'],
  ['>??<', '>\uC8FC\uC18C<'],
  ['???? ??', '\uBD88\uB7EC\uC624\uB294 \uC911\u2026'],
  ['??? ??? ????. ?+ ???? ?? ??? ?????.', '\uB4F1\uB85D\uB41C \uC0AC\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \u300C+ \uCD94\uAC00\u300D\uB85C \uC2E0\uADDC \uC0AC\uC6D0\uC744 \uB4F1\uB85D\uD558\uC138\uC694.'],
  ['?? ????? ??? ??(/admin-gate) ID ??? ???? ???? ?????.', '\uCD5C\uADFC \uC811\uC18D\uB0A0\uC9DC\uB294 \uAD00\uB9AC\uC790 \uB300\uBB38(/admin-gate) ID \uB85C\uADF8\uC778 \uAE30\uC900\uC73C\uB85C \uBC31\uC5D4\uB4DC\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4.'],
  ['"?? ?? ??"', '"\uC2E0\uADDC \uC0AC\uC6D0 \uB4F1\uB85D"'],
  ['"?? ?? ??"', '"\uC0AC\uC6D0 \uC815\uBCF4 \uC218\uC815"'],
  ['"??*"', '"\uC131\uBA85*"'],
  ['"???*"', '"\uC785\uC0AC\uC77C"'],
  ['placeholder="?: ???"', 'placeholder="\uC608: \uAE30\uD68D\uBD80"'],
  ['"??? (??? ID)*"', '"\uC774\uBA54\uC77C (\uB85C\uADF8\uC778 ID)*"'],
  ['"??? ID:"', '"\uB85C\uADF8\uC778 ID:"'],
  ['placeholder="??? ?????"', 'placeholder="\uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694"'],
  ['"?? ????* (6? ??)"', '"\uCD08\uAE30 \uBE44\uBC00\uBC88\uD638* (6\uC790 \uC774\uC0C1)"'],
  ['"???? (?? ??)"', '"\uBE44\uBC00\uBC88\uD638 (\uBCC0\uACBD \uC2DC\uB9CC)"'],
  ['placeholder="???? ??? ????"', 'placeholder="\uB85C\uADF8\uC778\uC5D0 \uC0AC\uC6A9\uD560 \uBE44\uBC00\uBC88\uD638"'],
  ['ERP ?? ??', 'ERP \uBA54\uB274 \uAD8C\uD55C'],
  ['"?? ??"', '"\uC800\uC7A5 \uC911\u2026"'],
  ['"??"', '"\uC800\uC7A5"'],
  ['"\uAD8C\uD55C \uAD00\uB9AC\uB294 \uB9C8\uC2A4\uD130 \uACC4\uC815(', 'SKIP'],
];

// Manual block replacements for multi-line Korean
s = s.replace(
  /if \(!canManage\) \{[\s\S]*?<\/ErpPageShell>\s*\);\s*\}/,
  `if (!canManage) {
    const who = stored?.email || loginEmail || "\\uC54C \\uC218 \\uC5C6\\uC74C";
    return (
      <ErpPageShell title="\\uAD8C\\uD55C\\uAD00\\uB9AC">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          \\uAD8C\\uD55C \\uAD00\\uB9AC\\uB294 \\uB9C8\\uC2A4\\uD130 \\uACC4\\uC815({MASTER_EMAIL})\\uB9CC \\uC0AC\\uC6A9\\uD560 \\uC218 \\uC788\\uC2B5\\uB2C8\\uB2E4.
          <br />
          <span className="mt-1 inline-block text-amber-900/80">
            \\uD604\\uC7AC \\uB85C\\uADF8\\uC778: <strong>{who}</strong> \\u2014 \\uD478\\uD130 \\u300C\\uAD00\\uB9AC\\uC790\\uD398\\uC774\\uC9C0\\u300D\\uC5D0\\uC11C \\uB9C8\\uC2A4\\uD130 \\uACC4\\uC815\\uC73C\\uB85C \\uB2E4\\uC2DC
            \\uB85C\\uADF8\\uC778\\uD574 \\uC8FC\\uC138\\uC694.
          </span>
        </p>
      </ErpPageShell>
    );
  }`,
);

for (const [from, to, all] of reps) {
  if (from === 'SKIP') continue;
  if (all) s = s.replaceAll(from, to);
  else s = s.replace(from, to);
}

fs.writeFileSync(p, s, "utf8");
console.log("permissions text patched");
