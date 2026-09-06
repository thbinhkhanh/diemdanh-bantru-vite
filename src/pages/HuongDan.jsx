import React, { useState } from "react";
import {
  Typography,
  Container,
  Divider,
  Card,
  CardContent,
  Box,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from '@mui/icons-material/Download';

const GroupDetails = ({ items, groupKey }) => {
  const [openIndex, setOpenIndex] = useState(0); // Mở mục đầu tiên

  return (
  <>
    {items.map((item, index) => (
      <details
        key={`${groupKey}-${index}`}
        open={openIndex === index}
        onToggle={(e) => {
          if (e.target.open) {
            setOpenIndex(index); // Khi mở thì đóng các mục khác
          }
        }}
      >
        <summary>{item.title}</summary>
        <div>{item.content}</div>
      </details>
    ))}
  </>
);
};

export default function HuongDan() {
  const [openKey, setOpenKey] = useState(null);

  const handleToggle = (key) => {
    setOpenKey((prevKey) => (prevKey === key ? null : key));
  };

  const renderItem = (key, title, content) => (
    <Box key={key} sx={{ mb: 2 }}>
      <Box
        onClick={() => handleToggle(key)}
        sx={{
          cursor: "pointer",
          fontWeight: "bold",
          py: 1,
          px: 2,
          borderRadius: 1,
          backgroundColor: openKey === key ? "#bbdefb" : "#e3f2fd",
          ":hover": { backgroundColor: "#90caf9" },
        }}
      >
        {title}
      </Box>
      {openKey === key && (
        <Box sx={{ px: 2, py: 1 }}>
          {content}
        </Box>
      )}
    </Box>
  );

  return (
  <Box
    sx={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)",
      py: 0,
      px: 0,
    }}
  >
    <Container
      sx={{
        mt: { xs: '10px', sm: '10px' },
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
            HƯỚNG DẪN SỬ DỤNG
          </Typography>
          <Typography variant="body2">
            Hướng dẫn thao tác với hình ảnh minh họa
          </Typography>
        </Box>
      </Box>
    </Container>

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
          <Typography
              variant="h5"
              align="center"
              fontWeight="bold"
              sx={{ mt: 0, mb: 2, color: "#1976d2" }}
            >
              QUẢN LÝ BÁN TRÚ - ĐIỂM DANH
            </Typography>          
          <Divider sx={{ my: 2 }} />
          <div>
              {renderItem("1", "📝 0. Tài khoản", (
                <GroupDetails
                  groupKey="group-0"
                  items={[
                    {
                      title: "✅ 0.1 Đăn nhập",
                      content: (
                        <ul>
                          <li>
                            B1: Tại màn hình Đăng nhập, chọn lớp, nhập mật khẩu.<br /><br />
                            <img src="/images/H01_B2.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /><br />
                          </li>
                          <li>B2: Chọn <b>Đăng nhập</b>.</li>
                          <li>👉 Thao tác đăng nhập: chỉ thực hiện một lần duy nhất khi lần đầu mở ứng dụng.</li><br />
                          <li>Màn hinh đăng nhập thành công.<br /><br /><img src="/images/H01_B3.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /><br /></li>
                        </ul>
                      )
                    },
                    {
                      title: "🏫 0.2 Chuyển đổi tài khoản",
                      content: (
                        <ul>
                          <li> Muốn chuyển sang tài khoản khác, có thể thực hiện như sau:</li>
                          <br />
                          <li> B1: Chọn biểu tượng <b>chuyển đổi tài khoản</b> <br/><br /><img src="/images/H04_B1.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li> B2: Chọn <b>Khối</b>, <b>Lớp</b> muốn chuyển đổi, nhập mật khẩu rồi bấm <b>Đăng nhập</b><br /><br /><img src="/images/H04_B2.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li> B3: Đã chuyển sang tài khoản lớp 2.2<br /><br /><img src="/images/H04_B3.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li>
                        </ul>
                      )
                    },
                    {
                      title: "🏫 0.3 Đăng xuất",
                      content: (
                        <ul>
                          <li>B1: Chọn <b>Tài khoản</b></li>
                          <li>B2: Chọn <b>Đăng xuất</b><br /><br /><img src="/images/H02_B1b.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />                          
                          <li>👉 Muốn duy trì trạng thái đăng nhập thì không nên đăng xuất.</li>
                        </ul>
                      )
                    },
                    {
                      title: "🏫 0.4 Đổi mật khẩu",
                      content: (
                        <ul>
                          <li>👉 Để bảo mật thông nhân học sinh, thầy cô nên đổi mật khẩu tài khoản.</li>
                          <li>B1: Chọn <b>Tài khoản</b></li>
                          <li>B2: Chọn <b>Đổi mật khẩu</b><br /><br/><img src="/images/H02_B1c.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B3: Nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu.<br /><br/><img src="/images/H03_B1b.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B4: Chọn <b>Cập nhật</b>.</li>
                        </ul>
                      )
                    },                  
                  ]}
                />
              ))}
              

              {renderItem("2", "📝 1. Điểm danh", (
                <GroupDetails
                  groupKey="group-1"
                  items={[
                    {
                      title: "✅ 1.1 Điểm danh bán trú",
                      content: (
                        <ul>
                          <li>
                            B1: Tại <b>Trang chủ</b>, chọn biểu tượng Khối hoặc chọn Khối từ thanh menu.<br /><br />
                            <img src="/images/H01_B1.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /><br />
                          </li>
                          <li>
                            B2: <b>Đăng nhập:</b> Chọn lớp, nhập mật khẩu rồi chọn <b>Đăng nhập</b><br /><br />
                            <img src="/images/H01_B2.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /><br />
                          </li>
                          <li>
                            B3: Chọn <b>Bán trú, </b>hệ thống hiển thị danh sách học sinh bán trú.<br /><br />
                            <img src="/images/H01_B3.png" alt="B3" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /><br />
                          </li>
                          <li>B4: Tick học sinh để đánh dấu có ăn bán trú.</li>
                          <li>👉 Mọi thay đổi được tự động lưu.</li>
                        </ul>
                      )
                    },
                    {
                      title: "🏫 1.2 Điểm danh chuyên cần",
                      content: (
                        <ul>
                          <li>B1: Chọn <b>Điểm danh</b><br /><br /><img src="/images/H02_B1.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B2: Tick học sinh để đánh dấu nghỉ học, chọn có phép/không phép, nhập lý do nghỉ.<br /> </li>
                          <li>👉 Mọi thay đổi được tự động lưu.</li>
                        </ul>
                      )
                    },
                    {
                      title: "🏫 1.3 Nhật ký điểm danh",
                      content: (
                        <ul>
                          <li>B1: Chọn <b>Nhật ký điểm danh</b><br /><br/><img src="/images/H03_B1.png" alt="B1" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B2: Tại đây, có thể xem lại học sinh đã vắng trong ngày, trong tháng.<br /><br /><img src="/images/H03_B2.png" alt="B2" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li>
                        </ul>
                      )
                    },                  
                  ]}
                />
              ))}

              {renderItem("3", "🗓️ 2. Quản lý dữ liệu ngày", (
                <GroupDetails
                  groupKey="group-2"
                  items={[
                    {
                      title: "📌 2.1 Chốt số liệu",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Y tế</b><br /><br /><img src="/images/H11_B1.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B3: Chọn biểu tượng <b>Chốt số liệu</b><br /><br /><img src="/images/H11_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Chọn ngày cần chốt</li>
                          <li>B5: Nhấn <b>Cập nhật</b> để chốt<br /><br /><img src="/images/H11_B5.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li>
                        </ul>
                      )
                    },
                    {
                      title: "📊 2.2 Số liệu trong ngày",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Y tế</b></li>
                          <li>B3: Chọn biểu tượng <b>Số liệu trong ngày</b><br /><br /><img src="/images/H11_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Xem bảng tổng hợp số liệu trong ngày<br /><br /><img src="/images/H11_B3b.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li>
                        </ul>
                      )
                    },
                    {
                      title: "🛠️ 2.3 Điều chỉnh suất ăn",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Y tế</b></li>
                          <li>B3: Chọn biểu tượng <b>Điều chỉnh suất ăn</b><br /><br /><img src="/images/H11_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />              
                          <li>B4: Chọn lớp, chọn ngày<br /><br /><img src="/images/H13_B4.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B5: Tick học sinh và <b>Cập nhật</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "🗑️ 2.4 Xóa dữ liệu theo ngày",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Y tế</b></li>
                          <li>B3: Chọn biểu tượng <b>Xóa dữ liệu ngày</b><br /><br /><img src="/images/H11_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Chọn ngày cần xóa</li>   
                          <li>B5: Chọn ngày<br /><br /><img src="/images/H14_B5.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />                       
                          <li>B6: Chọn xóa <b>Toàn trường</b> hay <b>Chọn lớp</b> bất kỳ, nhấn <b>Thực hiện</b></li>
                        </ul>
                      )
                    }
                  ]}
                />
              ))}

              {renderItem("4", "📈 3. Thống kê", (
                <GroupDetails
                  groupKey="group-3"
                  items={[
                    {
                      title: "🗓️ 3.1 Thống kê theo ngày",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>                          
                          <li>B2: Đăng nhập bằng tài khoản<b>Kế toán</b><br /><br /><img src="/images/H21_B2.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B3: Chọn biểu tượng<b>Thống kê ngày</b><br /><br /><img src="/images/H21_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Chọn ngày<br /><br /><img src="/images/H21_B4.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B5: Xem tổng hợp</li>
                        </ul>
                      )
                    },
                    {
                      title: "📊 3.2 Chi tiết từng tháng",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Kế toán</b></li>
                          <li>B3: Chọn biểu tượng <b>Chi tiết tháng</b><br /><br /><img src="/images/H21_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li>                          <br />
                          <li>B4: Chọn tháng và lớp<br /><br /><img src="/images/H22_B4.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li>                          <br />
                          <li>B5: Nhấn <b>Hiện ngày</b> để xem chi tiết</li>
                        </ul>
                      )
                    },
                    {
                      title: "📚 3.3 Tổng hợp cả năm",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Kế toán</b></li>
                          <li>B3: Chọn biểu tượng <b>Tổng hợp năm</b><br /><br /><img src="/images/H21_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Chọn năm học và lớp<br /><br /><img src="/images/H23_B4.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B5: Nhấn <b>Hiện tháng</b> để xem chi tiết</li>
                        </ul>
                      )
                    }
                  ]}
                />
              ))}

              {renderItem("5", "👥 4. Danh sách học sinh", (
                <GroupDetails
                  groupKey="group-4"
                  items={[
                    {
                      title: "📅 4.1 Cập nhật danh sách",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>                          
                          <li>B2: Đăng nhập bằng tài khoản<b>BGH</b><br /><br /><img src="/images/H31_B2.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B3: Chọn biểu tượng <b>Cập nhật danh sách</b><br /><br /><img src="/images/H31_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Chọn lớp, tên học sinh, trạng thái đăng ký<br /><br /><img src="/images/H31_B4.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B5: Nhấn <b>Cập nhật</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "📋 4.2 Lập danh sách",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>BGH</b></li>
                          <li>B3: Chọn biểu tượng <b>Lập danh sách lớp</b><br /><br /><img src="/images/H31_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Vào lớp tương ứng</li>
                          <li>B5: Tick chọn học sinh đăng ký<br /><br /><img src="/images/H32_B5.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B6: Nhấn <b>Lưu</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "📄 4.3 Tải danh sách lên",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>BGH</b></li>
                          <li>B3: Chuẩn bị file Excel theo mẫu</li>
                          <li>B4: Chọn biểu tượng <b>Tải danh sách lên</b><br /><br /><img src="/images/H31_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B5: Chọn biểu tượng <b>Chọn file Excel</b><br /><br /><img src="/images/H33_B5.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B6: Chọn file danh sách và <b>Tải lên</b> hệ thống</li>
                        </ul>
                      )
                    },
                    {
                      title: "📄 4.4 Lịch sử đăng ký",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>BGH</b></li>
                          <li>B3: Chọn biểu tượng <b>Lịch sử đăng ký</b><br /><br /><img src="/images/H31_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li><br />
                          <li>B4: Xem lại lịch sử đăng ký bán trú<br /><br /><img src="/images/H34_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }}  /></li>
                        </ul>
                      )
                    }
                  ]}
                />
              ))}

              {renderItem("6", "🗄️ 5. Cơ sở dữ liệu", (
                <GroupDetails
                  groupKey="group-5"
                  items={[
                    {
                      title: "📅 5.1 Sao lưu",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>                          
                          <li>B2: Đăng nhập bằng tài khoản<b>Admin</b><br /><br /><img src="/images/H41_B2.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />     
                          <li>B3: Vào tab <b>Backup & Restore</b></li>
                          <li>B4: Chọn <b>Sao lưu dữ liệu</b><br /><br /><img src="/images/H41_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li> <br />
                          <li>B5: Chọn loại dữ liệu và định dạng (JSON/Excel)</li>
                          <li>B6: Nhấn <b>Sao lưu</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "🔁 5.2 Phục hồi",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Admin</b></li>
                          <li>B3: Vào tab <b>Backup & Restore</b><br /></li>
                          <li>B4: Chọn <b>Phục hồi dữ liệu</b> và tìm đến tệp đã sao lưu</li>
                          <li>B5: Chọn loại dữ liệu và định dạng (JSON/Excel)<br /><br /><img src="/images/H42_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li> <br />                          
                          <li>B6: Nhấn <b>Phục hồi</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "🗑️ 5.3 Xóa toàn bộ",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Admin</b></li>
                          <li>B3: Vào tab <b>Delete & Reset</b><br /></li>
                          <li>B4: Chọn <b>Xóa database</b><br /><br /><img src="/images/H43_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B5: Chọn loại dữ liệu cần xóa</li>
                          <li>B6: Chọn <b>Xóa dữ liệu</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "🆕 5.4 Khởi tạo năm mới",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Admin</b></li>
                          <li>B3: Vào tab <b>Account</b></li>
                          <li>B4: Chọn <b>Tạo Database năm mới</b><br /><br /><img src="/images/H44_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />                     
                          <li>B5: Chọn loại dữ liệu cần tạo</li>
                          <li>B6: Chọn <b>Tạo Database</b></li>
                        </ul>
                      )
                    },
                    {
                      title: "📂 5.5 Xem dữ liệu năm trước",
                      content: (
                        <ul>
                          <li>B1: Chọn menu <b>Quản lý</b></li>
                          <li>B2: Đăng nhập bằng tài khoản <b>Admin</b></li>
                          <li>B3: Chọn năm học cần xem tại tab <b>System</b><br /><br /><img src="/images/H45_B3.png" alt="" style={{ width: "100%", maxWidth: "480px", height: "auto", display: "block", margin: "0 auto" }} /></li><br />
                          <li>B4: Chọn <b>Hệ thống quản lý bán trú</b> để xem dữ liệu</li>
                        </ul>
                      )
                    }
                  ]}
                />
              ))}

            </div>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                href="/docs/HuongDan.pdf"
                startIcon={<DownloadIcon />}
              >
                Tải hướng dẫn sử dụng
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
