package com.assetflow.service;

import com.assetflow.entity.ActivityLog;
import com.assetflow.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository logRepo;

    public Page<ActivityLog> getAll(String search, int page, int size) {
        return logRepo.search(search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
    }
}
