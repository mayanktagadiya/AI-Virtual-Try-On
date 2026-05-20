from pydantic import BaseModel


class GarmentMeasurements(BaseModel):
    chest_cm: float
    length_cm: float
    sleeve_cm: float


class CatalogItem(BaseModel):
    id: str
    name: str
    image_url: str
    available_sizes: list[str]
    garment_measurements: GarmentMeasurements
