## Docker image build
```bash
docker build -t fragments-ui .
```

Run using Docker Compose:
```bash
docker-compose up
```

Or run using Docker directly:
```bash
docker run -p 3000:80 fragments-ui
```

To push to Docker Hub:
```bash
# Login to Docker Hub
docker login
# Tag your image
docker tag fragments-ui YOUR_DOCKERHUB_USERNAME/fragments-ui:latest
# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/fragments-ui:latest
```

