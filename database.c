# SQLite Operations and Data Management

#include <stdio.h>
#include <stdlib.h>
#include <sqlite3.h>

// Function to execute a query
int execute_query(sqlite3 *db, const char *sql) {
    char *errMsg = 0;
    int rc = sqlite3_exec(db, sql, 0, 0, &errMsg);
    if (rc != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", errMsg);
        sqlite3_free(errMsg);
        return rc;
    }
    return SQLITE_OK;
}

// Function to open a database connection
sqlite3* open_database(const char *db_name) {
    sqlite3 *db;
    if (sqlite3_open(db_name, &db) != SQLITE_OK) {
        fprintf(stderr, "Cannot open database: %s\n", sqlite3_errmsg(db));
        return NULL;
    }
    return db;
}

// Function to close the database connection
void close_database(sqlite3 *db) {
    sqlite3_close(db);
}

// Example of creating a table
void create_table(sqlite3 *db) {
    const char *sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);";
    execute_query(db, sql);
}

// Example of inserting data
void insert_data(sqlite3 *db, const char *name, int age) {
    char sql[256];
    snprintf(sql, sizeof(sql), "INSERT INTO users (name, age) VALUES ('%s', %d);", name, age);
    execute_query(db, sql);
}

// Example of querying data
void query_data(sqlite3 *db) {
    const char *sql = "SELECT * FROM users;";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            int id = sqlite3_column_int(stmt, 0);
            const char *name = (const char*)sqlite3_column_text(stmt, 1);
            int age = sqlite3_column_int(stmt, 2);
            printf("ID: %d, Name: %s, Age: %d\n", id, name, age);
        }
        sqlite3_finalize(stmt);
    } else {
        fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
    }
}

int main() {
    sqlite3 *db = open_database("test.db");
    if (!db) return EXIT_FAILURE;
    create_table(db);
    insert_data(db, "Alice", 30);
    insert_data(db, "Bob", 25);
    query_data(db);
    close_database(db);
    return EXIT_SUCCESS;
}