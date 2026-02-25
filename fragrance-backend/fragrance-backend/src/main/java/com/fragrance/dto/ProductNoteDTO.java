package com.fragrance.dto;

public class ProductNoteDTO {
    private Long id;
    private String type;
    private String noteName;

    public ProductNoteDTO() {
    }

    public ProductNoteDTO(Long id, String type, String noteName) {
        this.id = id;
        this.type = type;
        this.noteName = noteName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getNoteName() {
        return noteName;
    }

    public void setNoteName(String noteName) {
        this.noteName = noteName;
    }
}
