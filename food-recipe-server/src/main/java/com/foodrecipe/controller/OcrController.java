package com.foodrecipe.controller;

import com.foodrecipe.dto.OcrDTO;
import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    /**
     * OCR识别食材信息
     */
    @PostMapping("/recognize")
    public Result<Map<String, Object>> recognize(@RequestBody OcrDTO dto) {
        log.info("OCR识别请求");
        return ocrService.recognizeFood(dto.getImage());
    }
}
