// package com.stageooredoo.dashboard;
//
// import com.stageooredoo.dashboard.service.ExcelService;
// import org.springframework.web.bind.annotation.*;
//
// import java.util.*;
//
// @RestController
// @RequestMapping("/api")
// public class DataController {
//
// private final ExcelService excelService;
//
// public DataController(ExcelService excelService) {
// this.excelService = excelService;
// }
//
// @GetMapping("/data")
// public List<Map<String, String>> getData() throws Exception {
// return excelService.readExcelFile();
// }
// }
