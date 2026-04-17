#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <string.h>

void create_directory(const char *path) {
    if (mkdir(path, 0755) == -1) {
        perror("Failed to create directory");
    } else {
        printf("Directory created: %s\n", path);
    }
}

void create_folder_structure() {
    create_directory("/path/to/your/directory"); // specify your directory path here
    create_directory("/path/to/your/directory/SubFolder1");
    create_directory("/path/to/your/directory/SubFolder2");
}

int main() {
    create_folder_structure();
    return 0;
}