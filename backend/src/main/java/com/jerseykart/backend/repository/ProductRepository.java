package com.jerseykart.backend.repository;

import com.jerseykart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT p FROM Product p WHERE " +
           "(p.category.name = :category OR :category = '') AND " +
           "((p.discountPrice BETWEEN :minPrice AND :maxPrice) OR (p.price BETWEEN :minPrice AND :maxPrice))")
    List<Product> filterProducts(@Param("category") String category, 
                                 @Param("minPrice") Double minPrice, 
                                 @Param("maxPrice") Double maxPrice);
}
