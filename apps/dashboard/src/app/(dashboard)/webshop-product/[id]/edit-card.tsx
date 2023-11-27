import { type FC } from "react"
import { useProductDetailsContext } from "./provider"
import { useWebshopProductWriteForm } from "../write-form"

export const ProductEditCard: FC = () => {
  const { product } = useProductDetailsContext()

  const FormComponent = useWebshopProductWriteForm({
    label: "Oppdater stillingsannonse",
    onSubmit: (data) => {},
    defaultValues: {
      name: product.name,
      variantDescription: product.description,
      price: product.price,
      images: product.images.join(","),
    },
  })
  return <FormComponent />
}
