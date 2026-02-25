package com.fragrance.service;

import com.fragrance.dto.ProductResponseDTO;
import com.fragrance.mapper.ProductMapper;
import com.fragrance.model.*;
import com.fragrance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ProductSizeRepository sizeRepository;

    @Autowired
    private ProductNoteRepository noteRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Override
    public Map<String, Object> addProduct(Map<String, Object> productData, MultipartFile imageMain,
            MultipartFile[] gallery) {
        Map<String, Object> response = new HashMap<>();

        try {
            Product product = new Product();
            product.setName((String) productData.get("name"));
            product.setDescription((String) productData.get("description"));
            // Handle Category
            String categoryName = (String) productData.get("category");
            if (categoryName != null) {
                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository
                                .save(new Category(categoryName, categoryName.toLowerCase().replace(" ", "-"))));
                product.setCategory(category);
            }

            product.setSubCategory((String) productData.get("subCategory"));

            // Handle Brand
            String brandName = (String) productData.get("brand");
            if (brandName != null) {
                Brand brand = brandRepository.findByName(brandName)
                        .orElseGet(() -> brandRepository
                                .save(new Brand(brandName, brandName.toLowerCase().replace(" ", "-"), "")));
                product.setBrand(brand);
            }
            product.setSlug((String) productData.get("slug"));
            product.setShortDescription((String) productData.get("shortDescription"));
            product.setFullDescription((String) productData.get("fullDescription"));
            product.setConcentration((String) productData.get("concentration"));
            product.setFragranceCharacter((String) productData.get("character"));
            product.setSeason((String) productData.get("season"));
            product.setOccasion((String) productData.get("occasion"));
            product.setLongevity((String) productData.get("longevity"));
            product.setSillage((String) productData.get("sillage"));
            product.setIsFeatured(Boolean.TRUE.equals(productData.get("isFeatured")));
            product.setDate(System.currentTimeMillis());

            // Handle Prices/Sizes
            if (productData.get("priceBase") != null) {
                product.setPriceBase(Double.parseDouble(productData.get("priceBase").toString()));
            }

            // Save Main Image
            if (imageMain != null && !imageMain.isEmpty()) {
                product.setImageMain(fileStorageService.saveFile(imageMain));
            }

            // Save Gallery Images
            List<String> imageUrls = new ArrayList<>();
            if (gallery != null) {
                for (MultipartFile img : gallery) {
                    if (img != null && !img.isEmpty()) {
                        imageUrls.add(fileStorageService.saveFile(img));
                    }
                }
            }
            product.setImageGallery(imageUrls);

            Product savedProduct = productRepository.save(product);

            handleSizes(savedProduct, productData.get("sizes"));
            handleNotes(savedProduct, productData.get("notes"));

            response.put("success", true);
            response.put("message", "Luxury Product Added");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    @SuppressWarnings("unchecked")
    private void handleSizes(Product product, Object sizesData) {
        if (sizesData instanceof List) {
            List<Map<String, Object>> sizesList = (List<Map<String, Object>>) sizesData;
            for (Map<String, Object> sizeData : sizesList) {
                ProductSize size = new ProductSize();
                size.setProduct(product);
                size.setSizeMl((String) sizeData.get("sizeMl"));
                size.setPrice(Double.parseDouble(sizeData.get("price").toString()));
                size.setStock(Integer.parseInt(sizeData.get("stock").toString()));
                sizeRepository.save(size);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void handleNotes(Product product, Object notesData) {
        if (notesData instanceof List) {
            List<Map<String, Object>> notesList = (List<Map<String, Object>>) notesData;
            for (Map<String, Object> noteData : notesList) {
                ProductNote note = new ProductNote();
                note.setProduct(product);
                note.setNoteName((String) noteData.get("noteName"));
                note.setType(ProductNote.NoteType.valueOf((String) noteData.get("type")));
                noteRepository.save(note);
            }
        }
    }

    @Override
    public Map<String, Object> listProducts() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = productRepository.findAll();
            List<ProductResponseDTO> dtos = products.stream()
                    .map(ProductMapper::toDTO)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("products", dtos);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> getFilteredProducts(String category, String subCategory, String brand,
            Double minPrice, Double maxPrice, String concentration,
            String character, String occasion, String note, String season,
            String search, String sort, int page, int size) {

        List<String> categories = parseList(category);
        List<String> subCategories = parseList(subCategory);
        List<String> brands = parseList(brand);
        List<String> concentrations = parseList(concentration);
        List<String> characters = parseList(character);
        List<String> occasions = parseList(occasion);
        List<String> seasons = parseList(season);

        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = productRepository.findAll();

            // Apply Filters via Streams
            List<Product> filtered = products.stream()
                    .filter(p -> categories == null || (p.getCategory() != null
                            && categories.stream().anyMatch(c -> c.equalsIgnoreCase(p.getCategory().getName()))))
                    .filter(p -> subCategories == null
                            || subCategories.stream().anyMatch(s -> s.equalsIgnoreCase(p.getSubCategory())))
                    .filter(p -> brands == null || (p.getBrand() != null
                            && brands.stream().anyMatch(b -> b.equalsIgnoreCase(p.getBrand().getName()))))
                    .filter(p -> concentrations == null
                            || concentrations.stream().anyMatch(c -> c.equalsIgnoreCase(p.getConcentration())))
                    .filter(p -> characters == null
                            || characters.stream().anyMatch(c -> c.equalsIgnoreCase(p.getFragranceCharacter())))
                    .filter(p -> occasions == null
                            || occasions.stream().anyMatch(o -> o.equalsIgnoreCase(p.getOccasion())))
                    .filter(p -> seasons == null || seasons.stream().anyMatch(s -> s.equalsIgnoreCase(p.getSeason())))
                    .filter(p -> (minPrice == null || (p.getPriceBase() != null && p.getPriceBase() >= minPrice)))
                    .filter(p -> (maxPrice == null || (p.getPriceBase() != null && p.getPriceBase() <= maxPrice)))
                    .filter(p -> {
                        if (search == null || search.trim().isEmpty()) {
                            return true;
                        }
                        String searchTerm = search.toLowerCase().trim();
                        boolean nameMatch = p.getName() != null && p.getName().toLowerCase().contains(searchTerm);
                        boolean descMatch = p.getDescription() != null
                                && p.getDescription().toLowerCase().contains(searchTerm);
                        boolean brandMatch = p.getBrand() != null && p.getBrand().getName() != null
                                && p.getBrand().getName().toLowerCase().contains(searchTerm);
                        boolean catMatch = p.getCategory() != null && p.getCategory().getName() != null
                                && p.getCategory().getName().toLowerCase().contains(searchTerm);
                        return nameMatch || descMatch || brandMatch || catMatch;
                    })
                    .toList();

            // Apply Sorting
            List<Product> sorted = new ArrayList<>(filtered);
            if ("price-low".equals(sort)) {
                sorted.sort(
                        Comparator.comparing(Product::getPriceBase, Comparator.nullsLast(Comparator.naturalOrder())));
            } else if ("price-high".equals(sort)) {
                sorted.sort(
                        Comparator.comparing(Product::getPriceBase, Comparator.nullsLast(Comparator.reverseOrder())));
            } else if ("rating".equals(sort)) {
                sorted.sort(Comparator.comparing(Product::getRating, Comparator.nullsLast(Comparator.reverseOrder())));
            } else {
                sorted.sort(Comparator.comparing(Product::getDate, Comparator.nullsLast(Comparator.reverseOrder())));
            }

            // Pagination
            int total = sorted.size();
            int start = Math.min(page * size, total);
            int end = Math.min(start + size, total);
            List<Product> paginated = sorted.subList(start, end);

            List<ProductResponseDTO> dtos = paginated.stream()
                    .map(ProductMapper::toDTO)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("products", dtos);
            response.put("total", total);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    private List<String> parseList(String str) {
        if (str == null || str.isEmpty())
            return null;
        return Arrays.asList(str.split(","));
    }

    @Override
    public Map<String, Object> removeProduct(Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            productRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Product Removed");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> singleProduct(Long productId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Product> product = productRepository.findById(productId);
            if (product.isPresent()) {
                response.put("success", true);
                response.put("product", ProductMapper.toDTO(product.get()));
            } else {
                response.put("success", false);
                response.put("message", "Product not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> getProductBySlug(String slug) {
        Map<String, Object> response = new HashMap<>();
        try {
            // In real app, add findBySlug to repository
            List<Product> products = productRepository.findAll();
            Optional<Product> product = products.stream().filter(p -> slug.equals(p.getSlug())).findFirst();

            if (product.isPresent()) {
                response.put("success", true);
                response.put("product", ProductMapper.toDTO(product.get()));
            } else {
                response.put("success", false);
                response.put("message", "Product not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> getFilterOptions() {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("DEBUG: Fetching filter options manually...");
            Map<String, List<String>> filters = new HashMap<>();

            filters.put("categories", categoryRepository.findAll().stream()
                    .map(Category::getName)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            filters.put("brands", brandRepository.findAll().stream()
                    .map(Brand::getName)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            List<Product> products = productRepository.findAll();

            filters.put("concentration", products.stream()
                    .map(Product::getConcentration)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            filters.put("character", products.stream()
                    .map(Product::getFragranceCharacter)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            filters.put("season", products.stream()
                    .map(Product::getSeason)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            filters.put("occasion", products.stream()
                    .map(Product::getOccasion)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            filters.put("subCategory", products.stream()
                    .map(Product::getSubCategory)
                    .filter(s -> s != null)
                    .sorted().distinct().toList());

            response.put("success", true);
            response.put("filters", filters);
            System.out.println("DEBUG: Manual filter options fetch successful.");
        } catch (Throwable t) {
            System.err.println("DEBUG FATAL: Error in getFilterOptions: " + t.getMessage());
            t.printStackTrace();
            response.put("success", false);
            response.put("message", t.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> getRelatedProducts(Long productId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = productRepository.findAll();
            List<ProductResponseDTO> dtos = products.stream()
                    .limit(4)
                    .map(ProductMapper::toDTO)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("products", dtos);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    @Override
    public Map<String, Object> getBestSellers() {
        Map<String, Object> response = new HashMap<>();
        try {
            long fiveDaysAgo = System.currentTimeMillis() - (5L * 24 * 60 * 60 * 1000);
            List<Object[]> results = orderRepository.findBestSellers(fiveDaysAgo);

            List<Map<String, Object>> bestSellers = new ArrayList<>();
            for (Object[] result : results) {
                Long productId = ((Number) result[0]).longValue();
                Long totalSold = ((Number) result[1]).longValue();

                Optional<Product> productOpt = productRepository.findById(productId);
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("productId", product.getId());
                    productInfo.put("name", product.getName());
                    productInfo.put("image", product.getImageMain());
                    productInfo.put("price", product.getPriceBase());
                    productInfo.put("totalSold", totalSold);
                    bestSellers.add(productInfo);
                }
            }

            response.put("success", true);
            response.put("bestSellers", bestSellers);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }
}
