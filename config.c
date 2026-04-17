#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Configuration settings structure
typedef struct {
    char setting_name[50];
    char setting_value[100];
} ConfigSetting;

// Function to load configuration settings
void load_settings(ConfigSetting *settings, int max_settings) {
    FILE *file = fopen("config.txt", "r");
    if (file == NULL) {
        perror("Could not open config.txt");
        return;
    }
    int i = 0;
    while (i < max_settings && fscanf(file, "%49[^=]=%99s\n", settings[i].setting_name, settings[i].setting_value) == 2) {
        i++;
    }
    fclose(file);
}

// Function to get a setting value by its name
const char* get_setting_value(ConfigSetting *settings, int setting_count, const char *name) {
    for (int i = 0; i < setting_count; i++) {
        if (strcmp(settings[i].setting_name, name) == 0) {
            return settings[i].setting_value;
        }
    }
    return NULL; // Setting not found
}

// Function to save settings
void save_settings(ConfigSetting *settings, int setting_count) {
    FILE *file = fopen("config.txt", "w");
    if (file == NULL) {
        perror("Could not open config.txt for writing");
        return;
    }
    for (int i = 0; i < setting_count; i++) {
        fprintf(file, "%s=%s\n", settings[i].setting_name, settings[i].setting_value);
    }
    fclose(file);
}
