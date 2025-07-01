import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export const fetchStudentsFromFirestore = async (banTruCollection, className, useNewVersion) => {
  let snapshot;
  if (useNewVersion) {
    const q = query(collection(db, banTruCollection), where('lop', '==', className));
    snapshot = await getDocs(q);
  } else {
    snapshot = await getDocs(collection(db, banTruCollection));
  }

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};