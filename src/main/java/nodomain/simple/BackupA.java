package nodomain.simple;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.*;

public class BackupA {

    public Object json;
    public List<BackupA> list = new ArrayList<>();
    public BackupA context;

    public static BackupA createFromJson(Object json) {
        BackupA backupA = new BackupA();
        backupA.json = json;
        if (JSONUtil.has(json, "list")) {
            for (Object subJson : JSONUtil.getList(json, "list")) {
                BackupA subBackupA = createFromJson(subJson);
                backupA.list.add(subBackupA);
                subBackupA.context = backupA;
            }
        }
        return backupA;
    }

    public void run() throws IOException {
        for (BackupA backupA : list) {
            backupA.run();
        }
        if (JSONUtil.has(json, "type")) {
            String type = JSONUtil.getString(json, "type");
            System.out.println("job of type " + type);
            Path source = computePath("source");
            System.out.println("computed source: " + source);
            Path target = computePath("target");
            System.out.println("computed target: " + target);
            if (!target.toFile().exists()) {
                throw new RuntimeException("Target folder does not exist. Are you sure that it is right?");
            }
            switch (type) {
                case "full" -> {
                    String dateString = new SimpleDateFormat("yyMMdd_HH_mm_ss E").format(new Date());
                    Path targetWithTimestamp = target.resolve(dateString);
                    targetWithTimestamp.toFile().mkdir();
                    Utils.copyDirectory(source, targetWithTimestamp, false);
                }
                case "static" -> {
                    Utils.copyDirectory(source, target, false);
                }
                case "git" -> {
                    String gitExe = JSONUtil.getString(json, "exe");
                    Utils.runMultiplePlatformCommandsAndHold(
                        "cd \"" + source + "\"",
                        "\"" + gitExe + "\" push --progress \"" + target + "\" main:main");
                }
            }
        }
    }

    public Path computePath(String propertyName) {
        Path localPath = Path.of(Utils.emptyForNull(JSONUtil.getString(json, propertyName)));
        if (context == null) {
            return localPath;
        } else {
            return context.computePath(propertyName).resolve(localPath);
        }
    }
}