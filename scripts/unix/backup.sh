cd $(dirname "$0") && . ./changeDirectoryToBase.sh
./gradlew runWithConfig -Pcommand=backup
exec bash
