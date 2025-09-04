cd $(dirname "$0") && . ./changeDirectoryToBase.sh
./gradlew runWithConfig -Pcommand=replaceAndRun
