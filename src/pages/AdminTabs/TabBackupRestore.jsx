// src/pages/AdminTabs/TabBackupRestore.jsx
import {
  Box, Button, Stack, Typography, Divider, Alert, LinearProgress,
  Checkbox, Radio, RadioGroup, FormControlLabel, FormControl
} from "@mui/material";

export default function TabBackupRestore({
  showBackupOptions,
  setShowBackupOptions,
  showRestoreOptions,
  setShowRestoreOptions,
  selectedDataTypes,
  setSelectedDataTypes,
  backupFormat,
  setBackupFormat,
  selectedBackupFile,
  setSelectedBackupFile,
  restoreMode,
  setRestoreMode,
  restoreProgress,
  setRestoreProgress,
  alertMessage,
  setAlertMessage,
  alertSeverity,
  setAlertSeverity,
  inputRef,
  downloadBackupAsJSON,
  downloadBackupAsExcel,
  restoreFromJSONFile,
  restoreFromExcelFile,
}) {
  return (
    <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
        <Divider>
        <Typography fontWeight="bold">💾 Sao lưu & Phục hồi</Typography>
        </Divider>

        {/* Nút SAO LƯU */}
        {!showRestoreOptions && (
        <Button
            variant="contained"
            color="success"
            onClick={() => {
            setShowBackupOptions(true);
            setShowRestoreOptions(false);
            setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
            }}
        >
            📥 Sao lưu dữ liệu
        </Button>
        )}

        {/* Nút PHỤC HỒI */}
        {!showBackupOptions && (
        <Button
            variant="contained"
            color="secondary"
            onClick={() => {
            setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
            setSelectedBackupFile(null);
            if (inputRef.current) {
                inputRef.current.value = "";
                inputRef.current.click();
            }
            }}
        >
            🔁 Phục hồi dữ liệu
        </Button>
        )}

        {/* Giao diện SAO LƯU */}
        {showBackupOptions && (
        <>
            {/* Checkbox chọn dữ liệu */}
            <Stack spacing={0.5}>
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.danhsach} onChange={() => handleCheckboxChange("danhsach")} />}
                label="Danh sách"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.bantru} onChange={() => handleCheckboxChange("bantru")} />}
                label="Bán trú"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.diemdan} onChange={() => handleCheckboxChange("diemdan")} />}
                label="Điểm danh"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.nhatky} onChange={() => handleCheckboxChange("nhatky")} />}
                label="Nhật ký"
            />
            </Stack>

            {/* Radio chọn định dạng */}
            <FormControl component="fieldset" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Chọn định dạng:</Typography>
            <RadioGroup
                row
                value={backupFormat}
                onChange={(e) => setBackupFormat(e.target.value)}
            >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="excel" control={<Radio />} label="Excel" />
            </RadioGroup>
            </FormControl>

            {/* Nút Thực hiện & Hủy */}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ width: "50%" }}
                onClick={() => {
                const isEmpty =
                    !selectedDataTypes.danhsach &&
                    !selectedDataTypes.bantru &&
                    !selectedDataTypes.diemdan &&
                    !selectedDataTypes.nhatky;

                if (isEmpty) {
                    alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để sao lưu.");
                    return;
                }

                if (backupFormat === "json") {
                    downloadBackupAsJSON(selectedDataTypes);
                } else {
                    downloadBackupAsExcel(selectedDataTypes);
                }

                setShowBackupOptions(false);
                }}
            >
                ✅ Sao lưu
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{
                width: "50%",              // giữ nguyên nếu bạn muốn chiếm 50% chiều ngang
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem"
                }}
                onClick={() => {
                setShowBackupOptions(false);
                setSelectedDataTypes({
                    danhsach: false,
                    bantru: false,
                    diemdan: false,
                    nhatky: false
                });
                }}
            >
                ❌ HỦY
            </Button>
            </Stack>
        </>
        )}

        {/* Input chọn file phục hồi ẩn */}
        <input
        type="file"
        hidden
        ref={inputRef}
        accept={backupFormat === "json" ? ".json" : ".xlsx"}
        onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const isValid =
            (backupFormat === "json" && file.name.endsWith(".json")) ||
            (backupFormat === "excel" && file.name.endsWith(".xlsx"));

            if (isValid) {
            setSelectedBackupFile(file);
            setTimeout(() => setShowRestoreOptions(true), 0);
            } else {
            alert("❌ File không hợp lệ! Vui lòng chọn file đúng định dạng.");
            }
        }}
        />

        {/* Giao diện PHỤC HỒI */}
        {showRestoreOptions && selectedBackupFile && (
        <>
            <Stack spacing={0.5} sx={{ mt: 2 }}>
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.danhsach} onChange={() => handleCheckboxChange("danhsach")} />}
                label="Danh sách"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.bantru} onChange={() => handleCheckboxChange("bantru")} />}
                label="Bán trú"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.diemdan} onChange={() => handleCheckboxChange("diemdan")} />}
                label="Điểm danh"
            />
            <FormControlLabel
                control={<Checkbox checked={selectedDataTypes.nhatky} onChange={() => handleCheckboxChange("nhatky")} />}
                label="Nhật ký"
            />
            </Stack>
            

            <FormControl component="fieldset" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Chọn định dạng:</Typography>
            <RadioGroup
                row
                value={backupFormat}
                onChange={(e) => setBackupFormat(e.target.value)}
            >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="excel" control={<Radio />} label="Excel" />
            </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Chế độ phục hồi:</Typography>
            <RadioGroup
                row
                value={restoreMode}
                onChange={(e) => setRestoreMode(e.target.value)}
            >
                <FormControlLabel value="all" control={<Radio />} label="Ghi đè tất cả" />
                <FormControlLabel value="check" control={<Radio />} label="Chỉ ghi mới" />
            </RadioGroup>
            </FormControl>

            {/* Nút Thực hiện & Hủy */}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ width: "50%" }}
                onClick={() => {
                const isEmpty =
                    !selectedDataTypes.danhsach &&
                    !selectedDataTypes.bantru &&
                    !selectedDataTypes.diemdan &&
                    !selectedDataTypes.nhatky;

                if (isEmpty) {
                    alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để phục hồi.");
                    return;
                }

                if (!selectedBackupFile) {
                    alert("❌ Chưa chọn file phục hồi.");
                    return;
                }

                if (backupFormat === "json") {
                    restoreFromJSONFile(
                    selectedBackupFile,
                    setRestoreProgress,
                    setAlertMessage,
                    setAlertSeverity,
                    selectedDataTypes,
                    restoreMode
                    );
                } else {
                    restoreFromExcelFile(
                    selectedBackupFile,
                    setRestoreProgress,
                    setAlertMessage,
                    setAlertSeverity,
                    selectedDataTypes,
                    restoreMode
                    );
                }

                setShowRestoreOptions(false);
                setSelectedBackupFile(null);
                }}
            >
                ✅ PHỤC HỒI
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
                setShowRestoreOptions(false);
                setSelectedBackupFile(null);
                setSelectedDataTypes({
                    danhsach: false,
                    bantru: false,
                    diemdan: false,
                    nhatky: false
                });
                }}
            >
                ❌ HỦY
            </Button>
            </Stack>
        </>
        )}

        {/* Tiến trình phục hồi */}
        {restoreProgress > 0 && (
        <Box sx={{ mt: 2 }}>
            <LinearProgress
            variant="determinate"
            value={restoreProgress}
            sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" align="center" display="block" mt={0.5}>
            Đang phục hồi... {restoreProgress}%
            </Typography>
        </Box>
        )}

        {/* Thông báo */}
        {alertMessage && (
        <Alert severity={alertSeverity} onClose={() => setAlertMessage("")}>
            {alertMessage}
        </Alert>
        )}
    </Stack>
  );
}
