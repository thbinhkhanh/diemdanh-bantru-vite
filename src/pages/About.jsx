import React from "react";
import {
  Typography,
  Container,
  Divider,
  Card,
  CardContent,
  Link,
  Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export default function About() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)",
        py: 0,
        px: 0,
      }}
    >
      {/* Tiêu đề khung xanh */}
      <Container
        sx={{
          mt: { xs: "10px", sm: "10px" },
          width: { xs: "98%", sm: "90%", md: "850px" },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#2196f3",
            color: "#fff",
            borderRadius: 2,
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <InfoIcon sx={{ fontSize: 32, mr: 1 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              🏫 ỨNG DỤNG QUẢN LÝ BÁN TRÚ – ĐIỂM DANH
            </Typography>
            <Typography variant="body2">
              Trường Tiểu học Bình Khánh
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Nội dung chính */}
      <Container
        sx={{
          mt: 3,
          mb: 4,
          width: { xs: "98%", sm: "90%", md: "850px" },
          mx: "auto",
        }}
      >
        <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              Ứng dụng được phát triển nhằm hỗ trợ giáo viên và nhà trường trong công tác quản lý học sinh bán trú, cập nhật số liệu chuyên cần, thực hiện thống kê – báo cáo một cách nhanh chóng và chính xác.
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* CHỨC NĂNG CHÍNH */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>🧾 CHỨC NĂNG CHÍNH</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">🔷 ĐIỂM DANH</Typography>

              <Box sx={{ pl: 2 }}>
                <Typography fontWeight="bold" sx={{ color: '#d84315', mt: 1 }}>🔶 Chuyên cần</Typography>
                <ul style={{ paddingLeft: '2rem' }}>
                  <li>✅ <strong>Điểm danh hàng ngày:</strong> Giáo viên thực hiện điểm danh chuyên cần đầu mỗi buổi học.</li>
                  <li>🔄 <strong>Cập nhật trạng thái:</strong> Ghi nhận tình trạng đi học, nghỉ phép, nghỉ không phép.</li>
                  <li>📆 <strong>Lịch sử điểm danh:</strong> Xem lại thông tin chuyên cần theo từng học sinh, từng ngày.</li>
                </ul>

                <Typography fontWeight="bold" sx={{ color: '#d84315', mt: 2 }}>🔶 Bán trú</Typography>
                <ul style={{ paddingLeft: '2rem' }}>
                  <li>🍱 <strong>Ghi nhận danh sách học sinh ăn bán trú</strong> trong ngày hiện tại.</li>
                </ul>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* QUẢN LÝ DỮ LIỆU NGÀY */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>🗓️ QUẢN LÝ DỮ LIỆU NGÀY</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                📌 <strong>Chốt số liệu trong ngày</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Ghi nhận đầy đủ tình trạng chuyên cần và bán trú trong ngày hiện tại.<br />
                  • Tự động tổng hợp dữ liệu theo tháng và năm.<br />
                  • Lọc theo lớp để kiểm tra nhanh danh sách học sinh.
                </Box>
              </Typography>
              <Typography paragraph>
                📊 <strong>Số liệu trong ngày</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Hiển thị nhanh:<br />
                  <Box sx={{ pl: 2 }}>
                    o 📍 Sĩ số học sinh: đi học, nghỉ phép, nghỉ không phép.<br />
                    o 🍽️ Trạng thái ăn bán trú: có / không.
                  </Box>
                  • Lọc theo lớp, hiển thị chi tiết từng học sinh.
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* NHẬT KÝ ĐIỂM DANH */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>📖 NHẬT KÝ ĐIỂM DANH</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                ✅ <strong>Mô tả</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Tra cứu lịch sử điểm danh chuyên cần theo: ngày, tháng, năm.
                </Box>
              </Typography>
              <Typography paragraph>
                🔍 <strong>Tính năng chính</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Lọc dữ liệu theo ngày, tháng, năm và theo khối/lớp.<br />
                  • Hiển thị: họ tên học sinh, lớp, có phép/không phép, lý do vắng, số ngày nghỉ.
                </Box>
              </Typography>
              <Typography paragraph>
                📁 <strong>Chức năng bổ sung</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Xuất Excel: Tải xuống báo cáo nhanh.<br />
                  • Cảnh báo rõ ràng nếu không có dữ liệu phù hợp.
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* THỐNG KÊ THEO THÁNG */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>📅 THỐNG KÊ THEO THÁNG</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                📆 <strong>Chuyên cần</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Lọc theo tháng và lớp.<br />
                  • Hiển thị tổng số buổi học sinh vắng mặt.<br />
                  • Cho phép xuất báo cáo Excel.
                </Box>
              </Typography>
              <Typography paragraph>
                🍱 <strong>Bán trú</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Thống kê tổng số ngày học sinh ăn bán trú.<br />
                  • Lọc theo tháng và lớp.<br />
                  • Nút Hiện ngày: Xem chi tiết từng ngày.<br />
                  • Nút Xuất Excel: Tải báo cáo nhanh.
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* THỐNG KÊ THEO NĂM */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>📆 THỐNG KÊ THEO NĂM</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                📅 <strong>Chuyên cần</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Hiển thị tổng số buổi có mặt trong cả năm học.<br />
                  • Lọc theo năm học và lớp học.<br />
                  • Hỗ trợ xuất báo cáo dưới dạng Excel.
                </Box>
              </Typography>
              <Typography paragraph>
                🍱 <strong>Bán trú</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Bảng tổng số lần ăn bán trú của từng học sinh trong năm.<br />
                  • Tự động tổng hợp từ các tháng.<br />
                  • Nút Hiện tháng: Xem lại chi tiết theo tháng.<br />
                  • Xuất toàn bộ dữ liệu sang Excel.
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* CHỈNH SỬA DỮ LIỆU */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>🛠️ CHỈNH SỬA DỮ LIỆU</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                🔧 <strong>Điều chỉnh điểm danh & suất ăn</strong><br />
                <Box sx={{ pl: 2 }}>
                  • Sửa lại trạng thái chuyên cần hoặc đăng ký bán trú cho bất kỳ ngày nào.<br />
                  • Thêm, xoá học sinh trong danh sách ăn hoặc điểm danh.<br />
                  • Hệ thống sẽ cập nhật bảng thống kê tự động.
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* XÓA DỮ LIỆU THEO NGÀY */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>🗑️ XÓA DỮ LIỆU THEO NGÀY</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                • Cho phép xóa dữ liệu bán trú đã chốt trong một ngày bất kỳ.<br />
                • Sau khi xóa, các thống kê tháng/năm sẽ tự động cập nhật.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* BÁO CÁO & THỐNG KÊ */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>📈 BÁO CÁO & THỐNG KÊ</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                • 🗓️ Theo ngày: Tổng hợp sĩ số và suất ăn theo từng lớp trong một ngày.<br />
                • 📅 Theo tháng: Chi tiết số buổi học và số ngày ăn bán trú.<br />
                • 📚 Theo năm: Thống kê tổng số ngày học / ăn của toàn bộ học sinh.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* DANH SÁCH HỌC SINH */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>👥 DANH SÁCH HỌC SINH</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                • 📥 Cập nhật danh sách: Thêm hoặc xoá học sinh bán trú.<br />
                • 📋 Lập danh sách đăng ký: Chọn học sinh theo lớp.<br />
                • 📤 Tải danh sách: Nhập dữ liệu từ file Excel.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* CƠ SỞ DỮ LIỆU */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>🗄️ CƠ SỞ DỮ LIỆU</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography paragraph>
                • 📥 Sao lưu dữ liệu: Tải toàn bộ hệ thống về máy (.JSON / .Excel).<br />
                • 🔁 Phục hồi dữ liệu: Nhập lại dữ liệu từ bản sao lưu.<br />
                • 🗑️ Xóa toàn bộ dữ liệu: Làm trống toàn hệ thống điểm danh.<br />
                • 🆕 Khởi tạo năm học mới: Tạo dữ liệu mới, không xoá dữ liệu cũ.<br />
                • 📂 Xem dữ liệu cũ: Truy cập lại thông tin bán trú của các năm trước.
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Footer */}
            <Typography variant="body1" paragraph>
              📩 Góp ý, phản hồi:{" "}
              <Link href="mailto:thbinhkhanh@gmail.com" color="primary" underline="hover">
                thbinhkhanh@gmail.com
              </Link>
            </Typography>
            <Typography variant="body2" align="right" color="text.secondary">
              📅 Phiên bản: 2.0.0 — 🛠️ Cập nhật lần cuối: 21/06/2025
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
              © 2025 – Trường Tiểu học Bình Khánh
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
