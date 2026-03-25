package com.foodrecipe;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.foodrecipe.mapper")
@EnableScheduling
public class FoodRecipeApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodRecipeApplication.class, args);
    }
}
