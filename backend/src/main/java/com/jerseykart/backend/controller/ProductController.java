package com.jerseykart.backend.controller;

import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        String cat = category != null ? category : "";
        double min = minPrice != null ? minPrice : 0.0;
        double max = maxPrice != null ? maxPrice : 1000000.0;

        List<Product> res;
        if (search != null && !search.isBlank()) {
            res = productService.searchProducts(search.trim(), cat, min, max);
        } else if (category != null || minPrice != null || maxPrice != null) {
            res = productService.filterProducts(cat, min, max);
        } else {
            res = productService.getAllProducts();
        }

        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("/products/id/{productId}")
    public ResponseEntity<Product> findProductByIdHandler(@PathVariable Long productId) {
        Product product = productService.findProductById(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
}
