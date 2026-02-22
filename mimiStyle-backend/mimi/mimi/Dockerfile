# Giai đoạn 1: Build ứng dụng (Sử dụng Maven)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy file pom.xml và download dependencies trước (tận dụng Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code và thực hiện build
COPY src ./src
RUN mvn clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng (Chỉ cần JRE để giảm dung lượng image)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy file jar từ giai đoạn build sang
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]