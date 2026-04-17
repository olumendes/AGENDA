#ifndef FOLDER_MANAGER_H
#define FOLDER_MANAGER_H

// Folder manager header definitions
#include <string>
#include <vector>

class FolderManager {
public:
    void createFolder(const std::string& name);
    void deleteFolder(const std::string& name);
    std::vector<std::string> listFolders();
    bool folderExists(const std::string& name);

private:
    std::vector<std::string> folders;
};

#endif // FOLDER_MANAGER_H