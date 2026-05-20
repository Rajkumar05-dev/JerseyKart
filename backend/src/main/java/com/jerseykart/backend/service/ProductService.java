package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.Category;
import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.repository.CategoryRepository;
import com.jerseykart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    public Product createProduct(Product product) {
        if (product.getCategory() != null && product.getCategory().getName() != null) {
            Optional<Category> optCategory = categoryRepository.findByName(product.getCategory().getName());
            if (optCategory.isPresent()) {
                product.setCategory(optCategory.get());
            } else {
                Category newCategory = categoryRepository.save(product.getCategory());
                product.setCategory(newCategory);
            }
        }
        return productRepository.save(product);
    }

    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    public Product updateProduct(Long productId, Product req) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            if(req.getTotalQuantity() != null && req.getTotalQuantity() != 0) {
                product.setTotalQuantity(req.getTotalQuantity());
            }
            if(req.getPrice() != null) {
                product.setPrice(req.getPrice());
            }
            if(req.getDiscountPrice() != null) {
                product.setDiscountPrice(req.getDiscountPrice());
            }
            return productRepository.save(product);
        }
        return null;
    }

    public Product findProductById(Long id) {
        Optional<Product> opt = productRepository.findById(id);
        return opt.orElse(null);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> filterProducts(String category, Double minPrice, Double maxPrice) {
        return productRepository.filterProducts(category, minPrice, maxPrice);
    }

    public List<Product> searchProducts(String search, String category, Double minPrice, Double maxPrice) {
        return productRepository.searchProducts(search, category, minPrice, maxPrice);
    }
}
