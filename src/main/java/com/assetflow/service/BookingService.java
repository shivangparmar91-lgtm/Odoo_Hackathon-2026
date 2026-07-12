package com.assetflow.service;

import com.assetflow.entity.ResourceBooking;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.ResourceBookingRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final ResourceBookingRepository bookingRepo;
    private final UserRepository userRepo;

    public Page<ResourceBooking> getAll(int page, int size) {
        return bookingRepo.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public ResourceBooking getById(Long id) {
        return bookingRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    @Transactional
    public ResourceBooking create(Map<String, Object> body) {
        String resourceName = str(body.get("resourceName"));
        LocalDateTime start = dateTime(body.get("startTime"));
        LocalDateTime end = dateTime(body.get("endTime"));
        if (resourceName == null) throw new BadRequestException("Resource is required");
        if (start == null || end == null) throw new BadRequestException("Start and end time are required");
        if (!end.isAfter(start)) throw new BadRequestException("End time must be after start time");

        List<ResourceBooking> conflicts = bookingRepo.findConflicts(resourceName, start, end);
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This resource is already booked for the selected time slot");
        }

        ResourceBooking booking = ResourceBooking.builder()
                .user(currentUser())
                .resourceName(resourceName)
                .startTime(start)
                .endTime(end)
                .purpose(str(body.get("purpose")))
                .status("CONFIRMED")
                .build();
        return bookingRepo.save(booking);
    }

    @Transactional
    public void cancel(Long id) {
        ResourceBooking booking = getById(id);
        User user = currentUser();
        boolean isOwner = booking.getUser() != null && booking.getUser().getId().equals(user.getId());
        boolean isManager = user.getRole() == com.assetflow.entity.Role.ADMIN || user.getRole() == com.assetflow.entity.Role.ASSET_MANAGER;
        if (!isOwner && !isManager) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        bookingRepo.delete(booking);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private LocalDateTime dateTime(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        String s = String.valueOf(o).trim();
        try {
            return s.length() == 10 ? java.time.LocalDate.parse(s).atStartOfDay() : LocalDateTime.parse(s);
        } catch (Exception e) { return null; }
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }
}
