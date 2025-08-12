package com.stageooredoo.dashboard.controller;

import com.stageooredoo.dashboard.service.ExcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private ExcelService excelService;

    private final Map<String, List<Map<String, String>>> uploads = new HashMap<>();

    @PostMapping("/upload")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            List<Map<String, String>> data = excelService.readExcel(file);
            String uploadId = UUID.randomUUID().toString();
            uploads.put(uploadId, data);
            return Map.of("uploadId", uploadId);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Erreur lors de la lecture du fichier.");
        }
    }

    @GetMapping("/filters/all")
    public Map<String, List<String>> getAllFilters(@RequestParam String uploadId) {
        List<Map<String, String>> data = uploads.get(uploadId);
        if (data == null || data.isEmpty())
            return Map.of();

        Map<String, Set<String>> options = new LinkedHashMap<>();

        for (String key : data.get(0).keySet()) {
            options.put(key, new HashSet<>());
        }

        for (Map<String, String> row : data) {
            for (String key : row.keySet()) {
                String value = row.get(key);
                if (value != null && !value.isBlank()) {
                    options.get(key).add(value.trim());
                }
            }
        }

        Map<String, List<String>> result = new LinkedHashMap<>();
        for (Map.Entry<String, Set<String>> entry : options.entrySet()) {
            List<String> sorted = new ArrayList<>(entry.getValue());
            Collections.sort(sorted);
            result.put(entry.getKey(), sorted);
        }

        return result;
    }

    @GetMapping("/data")
    public Map<String, Object> getFilteredData(
            @RequestParam String uploadId,
            @RequestParam MultiValueMap<String, String> filters) {
        List<Map<String, String>> data = uploads.get(uploadId);
        if (data == null)
            return Map.of("rows", List.of());

        filters.remove("uploadId");

        List<Map<String, String>> filtered = data.stream()
                .filter(row -> {
                    for (String key : filters.keySet()) {
                        List<String> values = filters.get(key);
                        String cellValue = row.getOrDefault(key, "");
                        if (!values.contains(cellValue)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        return Map.of("rows", filtered);
    }
}
