package com.jerseykart.backend.config;

import com.jerseykart.backend.entity.Category;
import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.repository.ProductRepository;
import com.jerseykart.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        seedProduct(
                "Manchester United Home Jersey 2026",
                "Official-style home kit with breathable fabric and club crest. Perfect for match days.",
                2999.0, 2499.0, 17,
                "football", "Football", "Manchester United", "Home",
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Barcelona Away Jersey 2026",
                "Sleek away design with moisture-wicking material and classic blaugrana accents.",
                2799.0, 2299.0, 18,
                "football", "Football", "Barcelona", "Away",
                "https://images.unsplash.com/photo-1522778119026-d647f0566c20?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Real Madrid Home Jersey 2026",
                "Premium white home jersey with embroidered details and athletic fit.",
                3199.0, 2599.0, 19,
                "football", "Football", "Real Madrid", "Home",
                "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "India ODI Blue Jersey",
                "Iconic blue ODI jersey inspired by Team India. Lightweight and fan-ready.",
                2299.0, 1999.0, 13,
                "cricket", "Cricket", "India", "ODI",
                "https://images.unsplash.com/photo-1531415071028-05b841bc90ef?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "CSK Yellow Jersey",
                "Chennai Super Kings yellow jersey with bold team graphics.",
                2199.0, 1899.0, 15,
                "cricket", "Cricket", "CSK", "Home",
                "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Mumbai Indians Blue Jersey",
                "MI blue jersey built for comfort in stadiums and streetwear.",
                2199.0, 1899.0, 14,
                "cricket", "Cricket", "Mumbai Indians", "Home",
                "https://images.unsplash.com/photo-1622279452926-62d9bea8ddae?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "LA Lakers Purple & Gold Jersey",
                "Classic Lakers colors with premium stitching and relaxed fit.",
                2699.0, 2199.0, 16,
                "basketball", "Basketball", "LA Lakers", "Home",
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Chicago Bulls Red Jersey",
                "Legendary Bulls red jersey with iconic team styling.",
                2599.0, 2099.0, 12,
                "basketball", "Basketball", "Chicago Bulls", "Home",
                "https://images.unsplash.com/photo-1519861537503-b9d751faebeb?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Golden State Warriors Blue Jersey",
                "Warriors blue jersey with modern cut and soft-touch fabric.",
                2699.0, 2199.0, 15,
                "basketball", "Basketball", "Golden State Warriors", "Home",
                "https://images.unsplash.com/photo-1504450758481-7338eba2a38d?auto=format&fit=crop&w=800&q=80"
        );
        seedProduct(
                "Brazil 2002 Retro Jersey",
                "Throwback yellow Brazil kit celebrating the 2002 champions era.",
                3299.0, 2799.0, 20,
                "retro", "Retro", "Brazil", "Retro",
                "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80"
        );
    }

    private void seedProduct(
            String title,
            String description,
            double price,
            double discountPrice,
            int discountPercent,
            String categoryName,
            String sportType,
            String teamName,
            String jerseyType,
            String imageUrl
    ) {
        Category category = Category.builder()
                .name(categoryName)
                .description(sportType + " jerseys")
                .sportType(sportType)
                .build();

        Product product = Product.builder()
                .title(title)
                .description(description)
                .price(price)
                .discountPrice(discountPrice)
                .discountPercent(discountPercent)
                .totalQuantity(50)
                .category(category)
                .teamName(teamName)
                .jerseyType(jerseyType)
                .imageUrls(List.of(imageUrl))
                .sizes(Map.of("S", 10, "M", 20, "L", 15, "XL", 10))
                .build();

        productService.createProduct(product);
    }
}
