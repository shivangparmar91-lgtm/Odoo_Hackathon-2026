package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Booking;
import com.assetflow.backend.repositories.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    private final BookingRepository repo;
    public BookingController(BookingRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<Booking>> getAll(@RequestParam(required = false) String status) {
        List<Booking> all = repo.findAll();
        if (status != null && !status.isBlank())
            all = all.stream().filter(b -> status.equalsIgnoreCase(b.getStatus())).collect(Collectors.toList());
        return ResponseEntity.ok(all);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> getUpcoming() {
        return ResponseEntity.ok(repo.findAll().stream()
            .filter(b -> b.getStartDate() != null && !b.getStartDate().isBefore(LocalDate.now()))
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody Booking body) {
        if (body.getStatus() == null) body.setStatus("PENDING");
        return ResponseEntity.ok(repo.save(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Booking body) {
        return repo.findById(id).map(existing -> {
            if (body.getStatus() != null)  existing.setStatus(body.getStatus());
            if (body.getPurpose() != null) existing.setPurpose(body.getPurpose());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        return repo.findById(id).map(b -> {
            b.setStatus("CANCELLED");
            repo.save(b);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
