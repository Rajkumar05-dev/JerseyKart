package com.jerseykart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
    
    // Parent category for hierarchical, useful but maybe overkill.
    // We'll keep it simple: just sport or team category.
    private String sportType; // e.g., Football, Basketball, Cricket
}
