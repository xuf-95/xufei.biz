---
title: mysql stress test script
date: 2021-10-14
---


```bash
#!/bin/bash

# Configuration
DB_DRIVER="mysql"
DB_NAME="loadtest"
DB_USER="root"
DB_PASSWORD="Password"
DB_PORT="3306"
DB_HOST="host"
TABLES_COUNT=64
TABLE_SIZE=10000000
DURATION=300
REPORT_INTERVAL=3
THREADS_LIST=(4 8 16 32 64 128 256)
DELAY_BETWEEN_TESTS=60
PROGRESS_INTERVAL=100

# Create output directory
OUTPUT_DIR="sysbench_results_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

# Result file with timestamp
RESULT_FILE="${OUTPUT_DIR}/sysbench_summary_$(date +%Y%m%d_%H%M%S).csv"

# Write CSV header
echo "Threads,Queries per sec,Transactions per sec,95th percentile (ms),Avg Query Time (ms), Start Time, End Time" > "$RESULT_FILE"

# Main test loop
for threads in "${THREADS_LIST[@]}"; do
    echo "----------------------------------------------------------------"
    echo "Starting test with $threads threads"
    echo "----------------------------------------------------------------"
    
    # Get start time
    test_start=$(date +%s)
    
    # Output file for this test
    LOG_FILE="${OUTPUT_DIR}/mysql8.0_1st_${threads}_$(date +%Y%m%d_%H%M%S).log"
    
    # format start time
    std_start_time=$(date +%Y%m%d_%H:%M:%S)

    # Start sysbench in background
    sysbench /usr/local/share/sysbench/tests/include/oltp_legacy/oltp.lua \
        --db-driver="$DB_DRIVER" \
        --mysql-db="$DB_NAME" \
        --mysql-user="$DB_USER" \
        --mysql-password="$DB_PASSWORD" \
        --mysql-port="$DB_PORT" \
        --mysql-host="$DB_HOST" \
        --oltp-tables-count="$TABLES_COUNT" \
        --oltp-table-size="$TABLE_SIZE" \
        --time="$DURATION" \
        --max-requests=0 \
        --threads="$threads" \
        --report-interval="$REPORT_INTERVAL" \
        --forced-shutdown=1 \
        run > "$LOG_FILE" 2>&1 &
    
    SYSBENCH_PID=$!
    
    # Progress monitoring
    while ps -p $SYSBENCH_PID > /dev/null; do
        elapsed=$(( $(date +%s) - test_start ))
        if (( elapsed % PROGRESS_INTERVAL == 0 )); then
            echo "[$(date +%H:%M:%S)] Current threads: $threads, Elapsed: $elapsed/$DURATION seconds"
        fi
        sleep 1
    done

    # format end time
    std_end_time=$(date +%Y%m%d_%H:%M:%S)
    
    # Get end time
    test_end=$(date +%s)
    
    # Wait for sysbench to complete
    wait $SYSBENCH_PID
    
    # Parse results from log file
    queries_per_sec=$(grep "queries:" "$LOG_FILE" | awk '{print $3}' | tr -d '(')
    transactions_per_sec=$(grep "transactions:" "$LOG_FILE" | awk '{print $3}' | tr -d '(')
    percentile_95=$(grep "95th percentile:" "$LOG_FILE" | awk '{print $3}')
    avg_query_time=$(grep "avg:" "$LOG_FILE" | awk '{print $2}')
    
    # Output results to CSV
    echo "$threads,$queries_per_sec,$transactions_per_sec,$percentile_95,$avg_query_time,$std_start_time,$std_end_time" >> "$RESULT_FILE"
    
    echo "Completed test with $threads threads"
    echo "Results:"
    echo "Threads: $threads, Queries(per/snc): $queries_per_sec, Transactions(per/snd): $transactions_per_sec, 95th percentile: $percentile_95, Avg Query Time (ms): $avg_query_time, Start Time: $std_start_time, End Time: $std_end_time"
    echo ""
    
    # Delay between tests if not the last one
    if [[ "$threads" != "${THREADS_LIST[-1]}" ]]; then
        echo "Waiting $DELAY_BETWEEN_TESTS seconds before next test..."
        sleep "$DELAY_BETWEEN_TESTS"
    fi
done

echo "----------------------------------------------------------------"
echo "All tests completed. Results saved to:"
echo "Summary: $RESULT_FILE"
echo "Detailed logs in: $OUTPUT_DIR/"
echo "----------------------------------------------------------------"
```
---