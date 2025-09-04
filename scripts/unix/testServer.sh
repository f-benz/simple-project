cd $(dirname "$0") && . ./changeDirectoryToBase.sh
./gradlew test
xdg-open "./build/reports/tests/test/index.html"
./gradlew runWithConfig -Pcommand=test
