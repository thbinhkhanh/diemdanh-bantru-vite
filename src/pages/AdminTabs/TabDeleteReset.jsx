// src/pages/AdminTabs/TabDeleteReset.jsx
import {
  Box, Button, Divider, Stack, Typography, Alert, LinearProgress,
  Checkbox, FormControlLabel, FormGroup
} from "@mui/material";

export default function TabDeleteReset({
  showDeleteOptions,
  setShowDeleteOptions,
  deleteCollections,
  setDeleteCollections,
  handleDeleteCheckboxChange,
  handlePerformDelete,
  deleting,
  deletingLabel,
  progress,
  handleResetDangKyBanTru,
  handleResetDiemDanh,
  deleteProgress,
  defaultProgress,
  resetProgress,
  resetType,
  ResetProgressText,
  deleteMessage,
  deleteSeverity,
  defaultMessage,
  defaultSeverity,
  resetMessage,
  resetSeverity,
  setDeleteMessage,
  setDefaultMessage,
  setResetMessage,
}) {
  return (
    <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
        <Divider>
        <Typography fontWeight="bold">🗑️ Xóa & Reset dữ liệu</Typography>
        </Divider>

        {/* Nút bật/tắt nhóm checkbox + thực hiện xóa */}
        <Button
        variant="contained"
        color="error"
        onClick={() => {
            setShowDeleteOptions(prev => !prev);
            setDeleteCollections({ danhsach: false, bantru: false, diemdan: false, nhatkybantru: false, xoaHocSinhBanTru: false });
        }}
        >
        🗑️ Xóa Database
        </Button>

        {/* ✅ Khối checkbox + nút thực hiện xóa */}
        {showDeleteOptions && (
        <>
            <FormGroup sx={{ ml: 1 }}>
            <FormControlLabel
                control={
                <Checkbox
                    checked={deleteCollections.danhsach}
                    onChange={() => handleDeleteCheckboxChange("danhsach")}
                />
                }
                label="Danh sách"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={deleteCollections.bantru}
                    onChange={() => handleDeleteCheckboxChange("bantru")}
                />
                }
                label="Bán trú"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={deleteCollections.diemdan}
                    onChange={() => handleDeleteCheckboxChange("diemdan")}
                />
                }
                label="Điểm danh"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={deleteCollections.nhatkybantru}
                    onChange={() => handleDeleteCheckboxChange("nhatkybantru")}
                />
                }
                label="Lịch sử đăng ký"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={deleteCollections.xoaHocSinhBanTru}
                    onChange={() => handleDeleteCheckboxChange("xoaHocSinhBanTru")}
                />
                }
                label="Xóa học sinh bán trú"
            />
            </FormGroup>

            {/* Hai nút: Thực hiện xóa + Hủy */}
            <Stack direction="row" spacing={1}>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ width: "50%" }}
                onClick={handlePerformDelete}
            >
                ✅ Xóa dữ liệu
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{
                width: "50%",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem"
                }}
                onClick={() => {
                setShowDeleteOptions(false);
                setDeleteCollections({
                    danhsach: false,
                    bantru: false,
                    diemdan: false,
                    nhatkybantru: false,
                    xoaHocSinhBanTru: false
                });
                }}
            >
                ❌ HỦY
            </Button>
            </Stack>

            {deleting && (
            <Box sx={{ mt: 2 }}>
                <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
                />
                <ResetProgressText label={deletingLabel} progress={progress} />
            </Box>
            )}
        </>
        )}

        {/* Ẩn 2 nút reset nếu đang mở delete options */}
        {!showDeleteOptions && (
        <>
            <Button variant="contained" color="warning" onClick={handleResetDangKyBanTru}>
            ♻️ Reset bán trú
            </Button>

            <Button variant="contained" color="warning" onClick={handleResetDiemDanh}>
            ♻️ Reset điểm danh
            </Button>
        </>
        )}

        {/* ✅ Tiến trình cho hành động xóa & reset legacy */}
        {(deleteProgress > 0 || defaultProgress > 0) && (
        <Box sx={{ mt: 2 }}>
            <LinearProgress
            variant="determinate"
            value={deleteProgress || defaultProgress}
            sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" align="center" display="block" mt={0.5}>
            {deleteProgress > 0
                ? `Đang xóa dữ liệu bán trú... ${deleteProgress}%`
                : `Đang reset legacy... ${defaultProgress}%`}
            </Typography>
        </Box>
        )}

        {/* ✅ Tiến trình cho đăng ký và điểm danh bán trú */}
        {resetProgress > 0 && (
        <Box sx={{ mt: 2 }}>
            <LinearProgress
            variant="determinate"
            value={resetProgress}
            sx={{ height: 10, borderRadius: 5 }}
            />
            <ResetProgressText
            label={
                resetType === "dangky"
                ? "Đang reset bán trú"
                : "Đang reset điểm danh"
            }
            progress={resetProgress}
            />
        </Box>
        )}

        {/* 🔔 Thông báo kết quả */}
        {deleteMessage && (
        <Alert severity={deleteSeverity} onClose={() => setDeleteMessage("")}>
            {deleteMessage}
        </Alert>
        )}

        {defaultMessage && (
        <Alert
            severity={["info", "success", "error", "warning"].includes(defaultSeverity) ? defaultSeverity : "info"}
            onClose={() => setDefaultMessage("")}
        >
            {defaultMessage}
        </Alert>
        )}

        {resetMessage && (
        <Alert severity={resetSeverity} onClose={() => setResetMessage("")}>
            {resetMessage}
        </Alert>
        )}
    </Stack>
  );
}
