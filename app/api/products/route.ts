import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: body.portion_size,
        portion_unit: body.portion_unit,
        shelf_life_fresh: body.shelf_life_fresh,
        shelf_life_thawed: body.shelf_life_thawed,
        track_by_unit: body.track_by_unit
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: body.portion_size,
        portion_unit: body.portion_unit,
        shelf_life_fresh: body.shelf_life_fresh,
        shelf_life_thawed: body.shelf_life_thawed,
        track_by_unit: body.track_by_unit
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}