package com.stageooredoo.dashboard.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;

@Service
public class ExcelService {

    public List<Map<String, String>> readExcel(MultipartFile file) throws Exception {
        InputStream stream = file.getInputStream();
        Workbook workbook = WorkbookFactory.create(stream);
        Sheet sheet = workbook.getSheetAt(0);

        List<Map<String, String>> data = new ArrayList<>();

        Row headerRow = sheet.getRow(0);
        if (headerRow == null)
            return data;

        int columnCount = headerRow.getPhysicalNumberOfCells();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            Map<String, String> rowData = new LinkedHashMap<>();
            for (int j = 0; j < columnCount; j++) {
                Cell cell = row.getCell(j);
                String header = headerRow.getCell(j).getStringCellValue().trim();
                String value = (cell != null) ? getCellValueAsString(cell).trim() : "";
                rowData.put(header, value);
            }
            data.add(rowData);
        }

        workbook.close();
        return data;
    }

    private String getCellValueAsString(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toString()
                    : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue();
                } catch (IllegalStateException e) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> "";
        };
    }
}
