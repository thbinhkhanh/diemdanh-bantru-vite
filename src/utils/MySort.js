// src/utils/MySort.js
export function MySort(studentList) {
  return [...studentList].sort((a, b) => {
    const splitA = a.hoVaTen.trim().split(/\s+/);
    const splitB = b.hoVaTen.trim().split(/\s+/);

    const [hoA, ...restA] = splitA;
    const [hoB, ...restB] = splitB;

    const tenA = restA.pop();
    const tenB = restB.pop();

    const demA = restA.join(' ').toLowerCase();
    const demB = restB.join(' ').toLowerCase();

    const cmpTen = tenA.localeCompare(tenB, 'vi', { sensitivity: 'base' });
    if (cmpTen !== 0) return cmpTen;

    const cmpDem = demA.localeCompare(demB, 'vi', { sensitivity: 'base' });
    if (cmpDem !== 0) return cmpDem;

    return hoA.localeCompare(hoB, 'vi', { sensitivity: 'base' });
  });
}