// src/pages/AdminTabs/TabAccount.jsx
import {
  Box, Button, Divider, Stack, TextField, Typography, Alert, LinearProgress,
  FormControlLabel, Checkbox
} from "@mui/material";

export default function TabAccount({
  showCreatePassword,
  setShowCreatePassword,
  showResetPassword,
  setShowResetPassword,
  showCreateDatabase,
  setShowCreateDatabase,
  customUserPassword,
  setCustomUserPassword,
  updateTeacherName,
  setUpdateTeacherName,
  handleCreateAccounts,
  handleResetPasswords,
  updateTeacherNamesFromFile,
  progress,
  actionType,
  teacherProgress,
  message,
  severity,
  setMessage,
  options,
  setOptions,
  createNewYearData,
  navigate,
}) {
  return (
    <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
        <Divider>
        <Typography fontWeight="bold">👤 Database & Account</Typography>
        </Divider>

        {/* Nút tạo tài khoản người dùng */}
        {!showResetPassword && !showCreateDatabase && (
        <Button
            variant="contained"
            onClick={() => {
            setShowCreatePassword(true);
            setShowResetPassword(false);
            setShowCreateDatabase(false);
            setCustomUserPassword("");
            }}
        >
            🆕 TÀI KHOẢN NGƯỜI DÙNG
        </Button>
        )}

        {/* Nhóm tạo tài khoản hoặc cập nhật giáo viên */}
        {showCreatePassword && (
        <>
            <TextField
            label="🔑 Nhập mật khẩu tài khoản"
            type="password"
            value={customUserPassword}
            size="small"
            onChange={(e) => setCustomUserPassword(e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <input
                type="checkbox"
                checked={updateTeacherName}
                onChange={(e) => setUpdateTeacherName(e.target.checked)}
                style={{ marginRight: 8 }}
                id="updateTeacherName"
            />
            <label htmlFor="updateTeacherName">Cập nhật danh sách giáo viên</label>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
            <Button
                variant="contained"
                color={updateTeacherName ? "primary" : "success"}
                sx={{ flex: 63 }}
                onClick={async () => {
                if (updateTeacherName) {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".xlsx, .xls";
                    input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const confirmed = window.confirm("⚠️ Bạn có chắc muốn cập nhật tên giáo viên vào tài khoản?");
                    if (!confirmed) return;

                    setActionType("update");
                    await updateTeacherNamesFromFile(file, setTeacherProgress, setMessage, setSeverity, setUpdateTeacherName);
                    //setShowCreatePassword(false);
                    setCustomUserPassword("");
                    //setUpdateTeacherName(false);
                    };
                    input.click();
                } else {
                    const confirmed = window.confirm("⚠️ Bạn có chắc muốn tạo tài khoản cho toàn bộ lớp?");
                    if (!confirmed) return;
                    await handleCreateAccounts(customUserPassword);
                    setShowCreatePassword(false);
                    setCustomUserPassword("");
                    setUpdateTeacherName(false);
                }
                }}
            >
                {updateTeacherName ? "📤 CẬP NHẬT" : "✅ TẠO TÀI KHOẢN"}
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                sx={{
                flex: 35,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem"
                }}
                onClick={() => {
                setShowCreatePassword(false);
                setCustomUserPassword("");
                setUpdateTeacherName(false);
                }}
            >
                ❌ HỦY
            </Button>
            </Box>
        </>
        )}

        {/* Nút reset mật khẩu */}
        {!showCreatePassword && !showCreateDatabase && (
        <Button
            variant="contained"
            onClick={() => {
            setShowResetPassword(true);
            setShowCreatePassword(false);
            setShowCreateDatabase(false);
            setCustomUserPassword("");
            }}
        >
            🔁 RESET MẬT KHẨU
        </Button>
        )}

        {/* Nhóm reset mật khẩu */}
        {showResetPassword && (
        <>
            <TextField
            label="🔑 Nhập mật khẩu mới"
            type="password"
            value={customUserPassword}
            size="small"
            onChange={(e) => setCustomUserPassword(e.target.value)}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
            <Button
                variant="contained"
                color="warning"
                sx={{ width: "50%" }}
                onClick={async () => {
                const confirmed = window.confirm("⚠️ Bạn có chắc muốn reset mật khẩu cho toàn bộ lớp?");
                if (!confirmed) return;
                await handleResetPasswords(customUserPassword);
                setShowResetPassword(false);
                setCustomUserPassword("");
                }}
            >
                🔁 RESET
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                sx={{
                width: "50%",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem"
                }}
                onClick={() => {
                setShowResetPassword(false);
                setCustomUserPassword("");
                }}
            >
                ❌ HỦY
            </Button>
            </Box>
        </>
        )}

        {/* Nút Tạo Database Năm Mới */}
        {!showCreatePassword && !showResetPassword && !showCreateDatabase && (
        <Button
            variant="contained"
            onClick={() => {
            setShowCreateDatabase(true);
            setShowCreatePassword(false);
            setShowResetPassword(false);
            }}
        >
            🆕 TẠO DATABASE NĂM MỚI
        </Button>
        )}

        {/* Nhóm tạo database */}
        {showCreateDatabase && (
        <>
            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#1976d2",
                color: "#fff",
                px: 2,
                py: 1.2,
                borderRadius: 1,
                fontSize: "0.9375rem",
                boxShadow: 1,
                justifyContent: "flex-start",
            }}
            >
            <span role="img" aria-label="new" style={{ marginRight: 8 }}>
                🆕
            </span>
            TẠO DATABASE NĂM MỚI
            </Box>

            <Stack spacing={2} mt={2}>
            <FormGroup>
                <FormControlLabel
                control={
                    <Checkbox
                    checked={options.list}
                    onChange={(e) => setOptions((prev) => ({ ...prev, list: e.target.checked }))}
                    />
                }
                label="Danh sách"
                />
                <FormControlLabel
                control={
                    <Checkbox
                    checked={options.meal}
                    onChange={(e) => setOptions((prev) => ({ ...prev, meal: e.target.checked }))}
                    />
                }
                label="Bán trú"
                />
                <FormControlLabel
                control={
                    <Checkbox
                    checked={options.attendance}
                    onChange={(e) => setOptions((prev) => ({ ...prev, attendance: e.target.checked }))}
                    />
                }
                label="Điểm danh"
                />
                <FormControlLabel
                control={
                    <Checkbox
                    checked={options.log}
                    onChange={(e) => setOptions((prev) => ({ ...prev, log: e.target.checked }))}
                    />
                }
                label="Nhật ký"
                />
            </FormGroup>

            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                variant="contained"
                color="success"
                sx={{ flex: 63 }}
                onClick={async () => {
                    const { list, meal, attendance, log } = options;

                    if (!list && !meal && !attendance && !log) {
                    alert("⚠️ Vui lòng chọn ít nhất một mục để tạo database!");
                    return;
                    }

                    const confirmed = window.confirm("⚠️ Bạn có chắc muốn tạo dữ liệu năm mới?");
                    if (!confirmed) return;

                    await createNewYearData(options);
                    setShowCreateDatabase(false);
                    setOptions({ list: false, meal: false, attendance: false, log: false });
                }}
                >
                ✅ TẠO DATABASE
                </Button>

                <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                    setShowCreateDatabase(false);
                    setOptions({ list: false, meal: false, attendance: false, log: false });
                    setShowCreatePassword(false);
                    setShowResetPassword(false);
                }}
                sx={{
                    flex: 35,
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                }}
                >
                ❌ HỦY
                </Button>
            </Box>
            </Stack>
        </>
        )}

        {/* Nút chuyển đến danh sách tài khoản */}
        {!showCreatePassword && !showResetPassword && !showCreateDatabase && (
        <Button variant="contained" color="info" onClick={() => navigate("/accounts")}>
            📋 DANH SÁCH TÀI KHOẢN
        </Button>
        )}

        {/* Tiến trình tạo/reset tài khoản */}
        {progress > 0 && (
        <Box sx={{ mt: 2 }}>
            <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" align="center" display="block" mt={0.5}>
            {actionType === "create"
                ? `Đang tạo tài khoản... ${progress}%`
                : actionType === "reset"
                ? `Đang reset mật khẩu... ${progress}%`
                : ""}
            </Typography>
        </Box>
        )}

        {/* Tiến trình cập nhật giáo viên */}
        {teacherProgress > 0 && teacherProgress < 100 && (
        <Box sx={{ mt: 2 }}>
            <LinearProgress
            variant="determinate"
            value={teacherProgress}
            sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" align="center" display="block" mt={0.5}>
            Đang cập nhật giáo viên... {teacherProgress}%
            </Typography>
        </Box>
        )}

        {/* Thông báo */}
        {message && (
        <Alert severity={severity} onClose={() => setMessage("")} sx={{ mb: 2 }}>
            {message}
        </Alert>
        )}
    </Stack>
  );
}
