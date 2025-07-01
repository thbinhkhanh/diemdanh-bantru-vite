import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

async function createClassAccountsFromDanhSach() {
  try {
    const querySnapshot = await getDocs(
      collection(db, "DANHSACH_2024-2025/TRUONG/list")
    );

    for (const docSnap of querySnapshot.docs) {
      const className = docSnap.id; // ví dụ: "1.1", "5.5", v.v.

      // Tạo ACCOUNT chỉ nếu chưa tồn tại (tùy bạn)
      await setDoc(doc(db, "ACCOUNT", className), {
        password: "123456", // hoặc bất kỳ mật khẩu mặc định nào
      });
    }

    alert("✅ Đã tạo tài khoản cho các lớp thành công!");
  } catch (err) {
    console.error("❌ Lỗi tạo tài khoản lớp:", err);
    alert("❌ Không thể tạo tài khoản lớp!");
  }
}
